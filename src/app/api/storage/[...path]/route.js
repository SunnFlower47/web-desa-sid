import { NextResponse } from 'next/server';
import { getValidatedStorageKey } from '@/lib/security';

export async function GET(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const pathSegments = params.path || [];
    const storagePath = pathSegments.join('/');
    
    if (!storagePath) {
      return new NextResponse('Path not specified', { status: 400 });
    }

    // Fail-closed validation untuk storage secret key
    const { key: secretKey, error: keyError } = getValidatedStorageKey();
    if (!secretKey) {
      return NextResponse.json({
        success: false,
        message: 'Layanan penyimpanan berkas mengalami kendala konfigurasi server.'
      }, { status: 500 });
    }

    const baseUrl = process.env.INTERNAL_API_URL || 'https://api-vilage.sunnflower.site';
    const backendUrl = baseUrl.replace(/\/$/, "");
    
    // Pastikan ini langsung ke domain backend, bukan jalur API
    const targetUrl = `${backendUrl.replace(/\/api\/v1\/?$/, '')}/storage/${storagePath}`;

    const response = await fetch(targetUrl, {
      headers: {
        'X-Proxy-App-Id': secretKey,
        'X-Origin': 'cibatu-vibe-ai',
        'Accept': 'image/*, application/octet-stream'
      },
      // Cache gambar di level proxy
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      // Jika masih error, coba tanpa X-Origin (beberapa server sensitif)
      const retryResponse = await fetch(targetUrl);
      if (!retryResponse.ok) {
        console.error(`Backend storage error: ${retryResponse.status}`);
        return new NextResponse(`Image not found at backend`, { status: 404 });
      }
      
      const arrayBuffer = await retryResponse.arrayBuffer();
      const contentType = retryResponse.headers.get('content-type') || 'image/png';
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Ambil data binary
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Storage Proxy Error:', error.message);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
