import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request, { params: paramsPromise }) {
  try {
    // WAJIB di-await Sam di Next.js versi terbaru
    const params = await paramsPromise;
    const pathSegments = params.path || [];
    const storagePath = pathSegments.join('/');
    
    if (!storagePath) {
      return new NextResponse('Path not specified', { status: 400 });
    }

    const baseUrl = process.env.INTERNAL_API_URL || 'https://api-vilage.sunnflower.site';
    const backendUrl = baseUrl.replace(/\/$/, "");
    const secretKey = process.env.BACKEND_SECRET_KEY || 'CibatuVibeCoding2026';
    
    // Pastikan ini langsung ke domain backend, bukan jalur API
    const targetUrl = `${backendUrl.replace(/\/api\/v1\/?$/, '')}/storage/${storagePath}`;

    // Buat Signature
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(timestamp)
      .digest('hex');

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
