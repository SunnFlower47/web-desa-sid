# Arsitektur Sistem Cibatu Vibe AI

## 1. Teknologi Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v3/v4
- **State Management:** React Hooks bawaan (useState, useEffect)
- **HTTP Client:** Axios dengan Global Interceptors
- **Animasi:** Framer Motion

## 2. Pola Keamanan Proxy
Untuk menyembunyikan endpoint backend asli (Laravel), aplikasi ini mengimplementasikan **Next.js Route Handlers** sebagai Proxy di `src/app/api/proxy/[...path]/route.js`.
1. *Client* mengirim *request* ke `/api/proxy/v1/...`
2. *Next.js Server* menerima *request*, menyisipkan kunci `X-Proxy-App-Id`.
3. *Next.js Server* meneruskan (forward) *request* ke backend Laravel asli (misal `https://admin.pemdescibatu2001.online/...`).

## 3. Strategi Caching (Server-Side)
Aplikasi memanfaatkan *Data Cache* bawaan Next.js App Router saat melakukan GET request di level Proxy:
- Data Statis (Struktur Desa): *Cache* 24 Jam
- Data Semi-Statis (Info Desa, GeoJSON): *Cache* 6 Jam
- Data Dinamis (Statistik, APBDes): *Cache* 30 Menit - 1 Jam
- Data Sangat Dinamis (Berita): *Cache* 10 Menit

## 4. Keamanan reCAPTCHA
- **v3 (Invisible):** Disisipkan otomatis di setiap *request* manipulasi data (POST, PUT) melalui Axios Interceptor.
- **v2 (Checkbox):** Diwajibkan di form spesifik seperti Testimoni, Kontak, dan Surat, di-render secara eksplisit sebelum tombol Submit ditekan.
