import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';
import { getTenantFromHost } from '@/lib/server-api';
import {
  getValidatedSigningKey,
  validateProxyRoute,
  redactNik,
  buildCanonicalQuery,
  hashBody,
  buildCanonicalString,
  calculateSignature,
  generateNonce,
} from '@/lib/security';

export async function GET(request, { params }) {
  return handleRequest('GET', request, params);
}

export async function POST(request, { params }) {
  return handleRequest('POST', request, params);
}

/**
 * Validasi apakah string adalah format IPv4 atau IPv6 yang valid
 * @param {string} ip
 * @returns {boolean}
 */
function isValidIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(trimmed) || (trimmed.includes(':') && ipv6.test(trimmed));
}

/**
 * Ekstraksi alamat IP klien terpercaya
 * @param {Request} request
 * @returns {string}
 */
function extractClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const firstIp = xff.split(',')[0].trim();
    if (isValidIp(firstIp)) {
      return firstIp;
    }
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  return '127.0.0.1';
}

async function handleRequest(method, request, paramsPromise) {
  const params = await paramsPromise;
  const pathArray = params.path || [];
  const path = pathArray.join('/');

  // 1. Validasi Allowlist & Anti Path Traversal
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

  // 2. Fail-closed validation untuk signing key (Protokol CIBATU-PROXY-V2)
  const { key: signingKey, keyId, error: keyError } = getValidatedSigningKey();
  if (!signingKey || keyError) {
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
  const isPost = method === 'POST';
  const rawContentType = request.headers.get('content-type') || '';
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  let rawBodyPayload = '';
  let bodySha256 = '';
  let isMultipart = false;

  if (isPost) {
    isMultipart = rawContentType.includes('multipart/form-data');
    const isJson = rawContentType.includes('application/json');

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
        const buffer = Buffer.from(await request.arrayBuffer());
        if (buffer.length > MAX_MULTIPART_SIZE) {
          return NextResponse.json({
            success: false,
            message: 'Ukuran payload melebihi batas maksimum 10MB.'
          }, { status: 413 });
        }
        rawBodyPayload = buffer;
        bodySha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      } else {
        const text = await request.text();
        if (text) {
          if (Buffer.byteLength(text, 'utf8') > MAX_JSON_SIZE) {
            return NextResponse.json({
              success: false,
              message: 'Ukuran payload melebihi batas maksimum 2MB.'
            }, { status: 413 });
          }
          // Validasi parsing format JSON
          JSON.parse(text);
          rawBodyPayload = text;
          bodySha256 = hashBody(text);
        } else {
          rawBodyPayload = '';
          bodySha256 = hashBody('');
        }
      }
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: 'Format data request tidak valid.'
      }, { status: 400 });
    }
  } else {
    // GET request selalu memiliki body hash dari empty string
    bodySha256 = hashBody('');
  }

  // 5. Ekstraksi Query dan Client IP
  const urlObj = new URL(request.url);
  const searchParams = urlObj.searchParams;
  const canonicalQuery = buildCanonicalQuery(searchParams);
  const queryString = searchParams.toString();
  const clientIp = extractClientIp(request);
  const clientHost = request.headers.get('host') || '';
  const tenantId = getTenantFromHost(clientHost) || process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'cibatu';

  // 6. Penyusunan Signature Protokol CIBATU-PROXY-V2
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = generateNonce();
  const canonicalPath = '/api/proxy/v1/' + path.replace(/^\/+/, '');

  const canonicalString = buildCanonicalString(
    method,
    canonicalPath,
    canonicalQuery,
    timestamp,
    nonce,
    clientIp,
    bodySha256
  );
  const signature = calculateSignature(canonicalString, signingKey);

  // 7. Header Sanitization: Teruskan header V2, JANGAN teruskan X-Proxy-App-Id, Authorization, atau Cookie klien
  const forwardedHeaders = {
    'Accept': 'application/json',
    'User-Agent': request.headers.get('user-agent') || 'Cibatu-Next-Proxy/2.0',
    'X-Tenant': tenantId,
    'X-Key-Id': keyId,
    'X-Timestamp': String(timestamp),
    'X-Nonce': nonce,
    'X-Client-Ip': clientIp,
    'X-Content-Sha256': bodySha256,
    'X-Signature': signature,
  };

  if (isPost) {
    if (isMultipart) {
      forwardedHeaders['Content-Type'] = rawContentType;
    } else {
      forwardedHeaders['Content-Type'] = 'application/json';
    }
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

  // 8. Bangun URL Target Laravel
  let baseUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000';
  baseUrl = baseUrl.replace(/\/$/, '');
  const backendUrl = `${baseUrl}${canonicalPath}${queryString ? `?${queryString}` : ''}`;

  try {
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
        data: rawBodyPayload,
        headers: forwardedHeaders,
        validateStatus: () => true,
        timeout: 30000,
      });

      return NextResponse.json(response.data, { status: response.status });
    }
  } catch (error) {
    const sanitizedError = redactNik(error.message);
    console.error(`[Next-Proxy] Error [${method} /api/proxy/${path}]:`, sanitizedError);
    return NextResponse.json({
      success: false,
      message: 'Server desa sedang sibuk.'
    }, { status: 500 });
  }
}
