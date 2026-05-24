import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, { params }) {
  return handleRequest('GET', request, params);
}

export async function POST(request, { params }) {
  return handleRequest('POST', request, params);
}

export async function PUT(request, { params }) {
  return handleRequest('PUT', request, params);
}

export async function PATCH(request, { params }) {
  return handleRequest('PATCH', request, params);
}

export async function DELETE(request, { params }) {
  return handleRequest('DELETE', request, params);
}

async function handleRequest(method, request, paramsPromise) {
  const params = await paramsPromise;
  const pathArray = params.path || [];
  const path = pathArray.join('/');
  const searchParams = new URL(request.url).searchParams;
  const queryString = searchParams.toString();

  // Ambil Config dari .env
  let baseUrl = process.env.INTERNAL_API_URL || 'https://api-vilage.sunnflower.site';
  baseUrl = baseUrl.replace(/\/$/, "");
  const proxyKey = process.env.NEXT_PUBLIC_PROXY_KEY;

  // --- SECURITY LAYER: Mencegah Akses Langsung ---
  const fetchSite = request.headers.get('sec-fetch-site');
  const referer = request.headers.get('referer');

  // Tolak jika diakses langsung via address bar browser ('none') 
  // ATAU jika diakses via Postman/cURL (fetchSite null & referer null)
  if (fetchSite === 'none' || (!fetchSite && !referer)) {
    console.warn(`[Security Block] Direct access attempt to: /api/proxy/${path}`);
    return NextResponse.json({
      success: false,
      message: 'Akses Ditolak: Endpoint ini hanya menerima request internal dari UI.'
    }, { status: 403 });
  }
  // -----------------------------------------------

  // Tembak ke Proxy Controller Laravel
  const backendUrl = `${baseUrl}/api/proxy/v1/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    let body = undefined;
    const headers = {
      'Accept': 'application/json',
      'X-Proxy-App-Id': proxyKey,
      'X-Origin': 'cibatu-vibe-ai',
      'User-Agent': request.headers.get('user-agent') || 'Cibatu-Next-Proxy/1.0',
    };

    // Forward token keamanan penting jika ada
    const recaptchaV3 = request.headers.get('X-Recaptcha-V3-Token');
    const recaptcha = request.headers.get('X-Recaptcha-Token');
    const csrf = request.headers.get('X-CSRF-Token');

    if (recaptchaV3) headers['X-Recaptcha-V3-Token'] = recaptchaV3;
    if (recaptcha) headers['X-Recaptcha-Token'] = recaptcha;
    if (csrf) headers['X-CSRF-Token'] = csrf;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('multipart/form-data')) {
          body = await request.formData();
        } else {
          const text = await request.text();
          body = text ? JSON.parse(text) : undefined;
          headers['Content-Type'] = 'application/json';
        }
      } catch (e) {
        // Silently fail for empty bodies
      }
    }

    const response = await axios({
      method,
      url: backendUrl,
      data: body,
      headers: headers,
      validateStatus: () => true, // Forward all statuses
      timeout: 30000,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('[Next-Proxy] Error details:', error.message, error.stack, 'Backend URL:', backendUrl);
    return NextResponse.json({
      success: false,
      message: 'Server desa sedang sibuk.',
      error: error.message,
      url: backendUrl
    }, { status: 500 });
  }
}
