import { NextResponse } from 'next/server';
import axios from 'axios';
import { getTenantFromHost } from '@/lib/server-api';
import { getValidatedProxyKey, validateProxyRoute, redactNik } from '@/lib/security';

export async function GET(request, { params }) {
  return handleRequest('GET', request, params);
}

export async function POST(request, { params }) {
  return handleRequest('POST', request, params);
}

async function handleRequest(method, request, paramsPromise) {
  const params = await paramsPromise;
  const pathArray = params.path || [];
  const path = pathArray.join('/');

  // 1. Validasi Route & Anti Path Traversal (Allowlist)
  const routeValidation = validateProxyRoute(method, path);
  if (!routeValidation.allowed) {
    if (routeValidation.reason === 'PATH_TRAVERSAL_DETECTED') {
      return NextResponse.json({
        success: false,
        message: 'Akses Ditolak: Pola path tidak valid.'
      }, { status: 400 });
    }
    return NextResponse.json({
      success: false,
      message: 'Akses Ditolak: Endpoint tidak ditemukan dalam allowlist proxy.'
    }, { status: 404 });
  }

  // 2. Fail-closed validation untuk proxy key (tanpa fallback NEXT_PUBLIC_)
  const { key: proxyKey } = getValidatedProxyKey();
  if (!proxyKey) {
    return NextResponse.json({
      success: false,
      message: 'Layanan proxy internal mengalami kendala konfigurasi server.'
    }, { status: 500 });
  }

  // 3. Security Block: Mencegah Akses Langsung Browser / Tool Eksternal
  const fetchSite = request.headers.get('sec-fetch-site');
  const referer = request.headers.get('referer');

  if (fetchSite === 'none' || (!fetchSite && !referer)) {
    console.warn(`[Security Block] Direct access attempt to: /api/proxy/${path}`);
    return NextResponse.json({
      success: false,
      message: 'Akses Ditolak: Endpoint ini hanya menerima request internal dari UI.'
    }, { status: 403 });
  }

  // 4. Pembatasan Content-Type dan Payload Size untuk Mutating Requests (POST)
  let body = undefined;
  const isPost = method === 'POST';
  const rawContentType = request.headers.get('content-type') || '';
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);

  if (isPost) {
    const isMultipart = rawContentType.includes('multipart/form-data');
    const isJson = rawContentType.includes('application/json');

    // Tolak Content-Type yang tidak didukung
    if (!isMultipart && !isJson && rawContentType !== '') {
      return NextResponse.json({
        success: false,
        message: 'Tipe konten (Content-Type) tidak didukung.'
      }, { status: 415 });
    }

    const MAX_JSON_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_MULTIPART_SIZE = 10 * 1024 * 1024; // 10MB

    if (isMultipart && contentLength > MAX_MULTIPART_SIZE) {
      return NextResponse.json({
        success: false,
        message: 'Ukuran payload melebihi batas maksimum 10MB.'
      }, { status: 413 });
    }

    if (isJson && contentLength > MAX_JSON_SIZE) {
      return NextResponse.json({
        success: false,
        message: 'Ukuran payload melebihi batas maksimum 2MB.'
      }, { status: 413 });
    }

    try {
      if (isMultipart) {
        body = await request.formData();
      } else {
        const text = await request.text();
        if (text) {
          if (Buffer.byteLength(text, 'utf8') > MAX_JSON_SIZE) {
            return NextResponse.json({
              success: false,
              message: 'Ukuran payload melebihi batas maksimum 2MB.'
            }, { status: 413 });
          }
          body = JSON.parse(text);
        }
      }
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: 'Format data request tidak valid.'
      }, { status: 400 });
    }
  }

  // 5. Header Sanitization: Hanya teruskan header aman, tolak Authorization dan Cookie client
  const clientHost = request.headers.get('host') || '';
  const tenantId = getTenantFromHost(clientHost) || process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'cibatu';
  const clientIp = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';

  const forwardedHeaders = {
    'Accept': 'application/json',
    'X-Proxy-App-Id': proxyKey,
    'X-Origin': 'cibatu-vibe-ai',
    'User-Agent': request.headers.get('user-agent') || 'Cibatu-Next-Proxy/1.0',
    'X-Tenant': tenantId,
    'X-Forwarded-For': clientIp,
  };

  if (isPost && !rawContentType.includes('multipart/form-data')) {
    forwardedHeaders['Content-Type'] = 'application/json';
  }

  // Teruskan token keamanan captcha/csrf bila ada
  const recaptchaV3 = request.headers.get('x-recaptcha-v3-token') || request.headers.get('X-Recaptcha-V3-Token');
  const recaptcha = request.headers.get('x-recaptcha-token') || request.headers.get('X-Recaptcha-Token');
  const csrf = request.headers.get('x-csrf-token') || request.headers.get('X-CSRF-Token');

  if (recaptchaV3) {
    forwardedHeaders['X-Recaptcha-V3-Token'] = recaptchaV3;
    forwardedHeaders['x-recaptcha-v3-token'] = recaptchaV3;
  }
  if (recaptcha) {
    forwardedHeaders['X-Recaptcha-Token'] = recaptcha;
    forwardedHeaders['x-recaptcha-token'] = recaptcha;
  }
  if (csrf) {
    forwardedHeaders['X-CSRF-Token'] = csrf;
    forwardedHeaders['x-csrf-token'] = csrf;
  }

  // 6. Bangun URL Backend
  let baseUrl = process.env.INTERNAL_API_URL || 'https://api-vilage.sunnflower.site';
  baseUrl = baseUrl.replace(/\/$/, "");
  const searchParams = new URL(request.url).searchParams;
  const queryString = searchParams.toString();
  const backendUrl = `${baseUrl}/api/proxy/v1/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    // Native fetch untuk GET dengan caching Next.js
    if (method === 'GET') {
      let revalidateTime = 0; // default no-cache

      if (path === 'struktur-desa' || path === 'perangkat-desa') {
        revalidateTime = 86400; // 24 Jam
      } else if (
        path === 'desa-info' || 
        path === 'kontak-desa' || 
        path === 'contact/info' || 
        path === 'surat-types' || 
        path === 'berita-categories' || 
        path === 'fasilitas-desa' ||
        path === 'geojson'
      ) {
        revalidateTime = 21600; // 6 Jam
      } else if (path === 'statistics' || path === 'testimoni') {
        revalidateTime = 3600; // 1 Jam
      } else if (
        path === 'apbdes' || 
        path === 'proyek-pembangunan' || 
        path === 'bantuan-sosial-transparansi'
      ) {
        revalidateTime = 1800; // 30 Menit
      } else if (path.startsWith('berita') && path !== 'berita-categories') {
        revalidateTime = 600; // 10 Menit
      }

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: forwardedHeaders,
        next: { revalidate: revalidateTime }
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => null) || {};
      } else {
        data = await response.text();
      }

      return NextResponse.json(data, { status: response.status });
    } else {
      // POST via axios
      const response = await axios({
        method,
        url: backendUrl,
        data: body,
        headers: forwardedHeaders,
        validateStatus: () => true,
        timeout: 30000,
      });

      return NextResponse.json(response.data, { status: response.status });
    }
  } catch (error) {
    // Redaksi error message dan jangan leak backendUrl / query string ke response
    const sanitizedError = redactNik(error.message);
    console.error(`[Next-Proxy] Error [${method} /api/proxy/${path}]:`, sanitizedError);
    return NextResponse.json({
      success: false,
      message: 'Server desa sedang sibuk.'
    }, { status: 500 });
  }
}
