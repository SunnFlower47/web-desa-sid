// src/lib/server-api.js
import { headers } from 'next/headers';

export function getTenantFromHost(host) {
  if (!host) return null;
  
  // Bersihkan port jika ada (misal localhost:3030 atau cibatu.sistem-desa-cibatu.test:3030)
  const hostname = host.split(':')[0];
  
  // Daftar central domain
  const centralDomains = process.env.NEXT_PUBLIC_CENTRAL_DOMAINS
    ? process.env.NEXT_PUBLIC_CENTRAL_DOMAINS.split(',').map(d => d.trim())
    : [
        'sistem-desa-cibatu.test',
        'diskominfo.sistem-desa-cibatu.test',
        'admin.sistem-desa-cibatu.test',
        'purwakarta.desa.id',
        'diskominfo.purwakarta.desa.id',
        'admin.purwakarta.desa.id'
      ];
  
  if (centralDomains.includes(hostname)) {
    return null;
  }
  
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain !== 'admin' && subdomain !== 'diskominfo' && subdomain !== 'www') {
      return subdomain;
    }
  }
  
  return null;
}

export async function getDesaSettings() {
  const baseUrl = process.env.INTERNAL_API_URL || 'http://sistem-desa-cibatu.test';
  
  // Deteksi tenant dari Host header di server context
  let tenantId = null;
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    tenantId = getTenantFromHost(host);
  } catch (error) {
    // Diluar request context (misal saat build static / prerender)
    console.warn('[Server-API] Gagal membaca host header:', error.message);
  }

  // Gunakan fallback jika tidak terdeteksi (misal localhost development)
  tenantId = tenantId || process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'cibatu';
  
  try {
    const res = await fetch(`${baseUrl}/api/v1/public-statistics/info-desa`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Tenant': tenantId,
      },
      // Cache data selama 1 jam di environment production untuk performa SaaS.
      // Di lokal bisa lebih sering (misal 60 detik)
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      console.error(`Failed to fetch desa settings for tenant ${tenantId}. Status: ${res.status}`);
      if (res.status === 403) {
        try {
          const errJson = await res.json();
          if (errJson.error === 'TENANT_INACTIVE') {
            return {
              is_inactive: true,
              diskominfo_hotline: errJson.diskominfo_hotline,
              diskominfo_email: errJson.diskominfo_email
            };
          }
        } catch (e) {
          // ignore
        }
      }
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error(`Error fetching desa settings for tenant ${tenantId}:`, error.message);
    return null;
  }
}

