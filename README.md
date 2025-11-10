# MuseLab — Web Kolaborasi Kreatif Real-Time

MuseLab adalah platform kolaborasi kreatif real-time (seperti “Google Docs untuk seni”) dengan kanvas, komentar, dan sinkronisasi antar pengguna.

## Stack
- Frontend: Next.js (App Router) + TailwindCSS
- Backend: Express.js + Socket.io
- Database: PostgreSQL (Prisma ORM)
- Storage: Local disk (`/uploads`) via Multer (dapat diganti Supabase/Firebase)

## Menjalankan Secara Lokal
1. Jalankan Postgres:
   ```bash
   docker compose up -d
   ```
2. Buat file `.env` di root atau di `backend/` dengan isi minimal:
   ```
   DATABASE_URL="postgresql://muselab:muselab@localhost:5432/muselab?schema=public"
   JWT_SECRET="change_me_please"
   CORS_ORIGIN="http://localhost:3000"
   ```
3. Install dep:
   ```bash
   cd backend && npm i && npm run prisma:generate && npm run prisma:migrate
   cd ../frontend && npm i
   ```
4. Jalankan:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   # Terminal 2
   cd frontend && npm run dev
   ```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

## Ringkasan Endpoint Backend
- `GET /api/studios` — daftar studio milik/diikuti user (dengan owner, anggota, dan metrik).
- `GET /api/studios/public` — showcase publik tersortir terbaru.
- `GET /api/studios/insights/summary` — statistik studio/asset/comment milik user.
- `POST /api/studios` — buat studio baru (role ADMIN/EDITOR).
- `GET /api/studios/:id` — detail studio lengkap (asset, komentar, anggota).
- `POST /api/assets/upload` — unggah asset (validasi tipe file sesuai kategori).
- `DELETE /api/assets/:id` — hapus asset (hanya uploader/Admin).
- `GET /api/comments/studio/:studioId` — komentar lengkap + author.
- `POST /api/comments` — buat komentar baru (response termasuk data author).
- `DELETE /api/comments/:id` — hapus komentar (author/Admin).

## Catatan Auth
Contoh frontend menggunakan token dari `localStorage` (`muselab_token`). Untuk uji cepat, Anda bisa menyuntik token JWT manual:
```js
localStorage.setItem('muselab_token', '<Bearer JWT>');
```
Implementasi produksi sebaiknya memakai NextAuth/Clerk/Supabase Auth dan cookie httpOnly.

## Pengembangan Lanjut
- Ganti storage lokal ke Supabase/Firebase (lihat `backend/src/services/fileService.js`)
- Tambah role & perizinan granular (`authMiddleware.js`)
- Tambah waveform viewer, remix/fork, AI assist


