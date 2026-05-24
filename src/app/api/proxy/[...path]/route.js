import { NextResponse } from 'next/server';
import axios from 'axios';

// --- IN-MEMORY CACHE FOR PROXY GET REQUESTS ---
const proxyCache = new Map();

function getTtlForPath(path) {
  const cleanPath = path.toLowerCase();
  
  // Static Data - 24 hours
  if (
    cleanPath.includes('struktur-desa') || 
    cleanPath.includes('perangkat-desa') || 
    cleanPath.includes('rt-rw') || 
    cleanPath.includes('bumdes')
  ) {
    return 24 * 60 * 60 * 1000;
  }
  
  // Semi-Static Data - 6 hours
  if (
    cleanPath.includes('desa-info') || 
    cleanPath.includes('contact-info') || 
    cleanPath.includes('contact/info') || 
    cleanPath.includes('kontak-desa') || 
    cleanPath.includes('fasilitas-desa') || 
    cleanPath.includes('surat-types') ||
    cleanPath.includes('berita-categories')
  ) {
    return 6 * 60 * 60 * 1000;
  }
  
  // Medium Data - 1 hour
  if (
    cleanPath.includes('statistics') || 
    cleanPath.includes('testimoni') || 
    cleanPath.includes('umkm') || 
    cleanPath.includes('agenda-desa') ||
    cleanPath.includes('agenda-categories')
  ) {
    return 60 * 60 * 1000;
  }
  
  // Dynamic Data - 30 minutes
  if (
    cleanPath.includes('apbdes') || 
    cleanPath.includes('proyek-pembangunan') || 
    cleanPath.includes('proyek-desa') ||
    cleanPath.includes('bantuan-sosial-transparansi')
  ) {
    return 30 * 60 * 1000;
  }
  
  // Frequent Data - 10 minutes
  if (
    cleanPath.includes('berita') || 
    cleanPath.includes('announcements')
  ) {
    return 10 * 60 * 1000;
  }
  
  return 0; // Do not cache by default
}
// ----------------------------------------------

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

  // Cache lookup logic for GET
  const isGet = method === 'GET';
  const ttl = isGet ? getTtlForPath(path) : 0;
  const bypassCache = request.headers.get('cache-control') === 'no-cache' || searchParams.get('bypass-cache') === 'true';
  const cacheKey = `${path}${queryString ? `?${queryString}` : ''}`;

  if (isGet && ttl > 0 && !bypassCache) {
    const cachedItem = proxyCache.get(cacheKey);
    if (cachedItem && Date.now() < cachedItem.expiry) {
      console.log(`[Proxy Cache HIT] /api/proxy/${cacheKey} (expires in ${Math.round((cachedItem.expiry - Date.now()) / 1000)}s)`);
      return NextResponse.json(cachedItem.data, { status: 200 });
    }
    console.log(`[Proxy Cache MISS] /api/proxy/${cacheKey} (TTL: ${ttl / 1000}s)`);
  }

  // Ambil Config dari .env
  const baseUrl = process.env.INTERNAL_API_URL || 'https://api-vilage.sunnflower.site';
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

    // Cache setting logic for GET
    if (isGet && ttl > 0 && response.status === 200 && response.data?.success) {
      proxyCache.set(cacheKey, {
        data: response.data,
        expiry: Date.now() + ttl,
      });
      console.log(`[Proxy Cache SET] /api/proxy/${cacheKey} (expiry in ${ttl / 1000}s)`);
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('[Next-Proxy] Error:', error.message);
    return NextResponse.json({
      success: false,
      message: 'Server desa sedang sibuk.',
    }, { status: 500 });
  }
}
