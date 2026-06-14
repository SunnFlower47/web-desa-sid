// src/lib/server-api.js

export async function getDesaSettings() {
  const baseUrl = process.env.INTERNAL_API_URL || 'http://sistem-desa-cibatu.test';
  
  try {
    const res = await fetch(`${baseUrl}/api/v1/public-statistics/info-desa`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Cache data selama 1 jam di environment production untuk performa SaaS.
      // Di lokal bisa lebih sering (misal 60 detik)
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      console.error(`Failed to fetch desa settings. Status: ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('Error fetching desa settings:', error.message);
    return null;
  }
}
