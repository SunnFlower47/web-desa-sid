import { NextResponse } from 'next/server';
import { getValidatedStorageKey, validateStoragePath } from '@/lib/security';

export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const pathSegments = params.path || [];
    const storagePath = pathSegments.join('/');
    
    if (!storagePath) {
      return new NextResponse('Path not specified', { status: 400 });
    }

    // 1. Validasi Keamanan: Allowlist Prefix Publik & Anti Path Traversal
    const pathValidation = validateStoragePath(storagePath);
    if (!pathValidation.allowed) {
      if (pathValidation.reason === 'PATH_TRAVERSAL_DETECTED') {
        return new NextResponse('Invalid storage path', { status: 400 });
      }
      // Tolak akses ke direktori privat atau prefix tidak dikenal
      return new NextResponse('Resource not found or private', { status: 404 });
    }

    // 2. Fail-closed validation untuk storage secret key
    const { key: secretKey } = getValidatedStorageKey();
    if (!secretKey) {
      return NextResponse.json({
        success: false,
        message: 'Layanan penyimpanan berkas mengalami kendala konfigurasi server.'
      }, { status: 500 });
    }

    const baseUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000';
    const backendUrl = baseUrl.replace(/\/$/, "");
    
    // Pastikan menuju URL storage publik backend
    const targetUrl = `${backendUrl.replace(/\/api\/v1\/?$/, '')}/storage/${storagePath}`;

    const response = await fetch(targetUrl, {
      headers: {
        'X-Origin': 'cibatu-vibe-ai',
        'Accept': 'image/*, application/octet-stream'
      },
      // Cache gambar di level proxy
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      // Coba retry tanpa X-Origin jika server backend sensitif
      const retryResponse = await fetch(targetUrl);
      if (!retryResponse.ok) {
        return new NextResponse('Asset not found', { status: 404 });
      }
      
      const arrayBuffer = await retryResponse.arrayBuffer();
      const contentType = retryResponse.headers.get('content-type') || 'image/png';
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
        }
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
      }
    });

  } catch (error) {
    console.error('[Storage-Proxy] Error fetching asset:', error.message);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
