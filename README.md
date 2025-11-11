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
   
   Untuk OAuth (opsional), tambahkan di `backend/.env`:
   ```
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   ```
   
   Dan di `frontend/.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
   NEXT_PUBLIC_GITHUB_CLIENT_ID="your_github_client_id"
   NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
   ```
3. Install dep:
   ```bash
   cd backend && npm i && npm run prisma:generate && npm run prisma:migrate
   cd ../frontend && npm i
   ```
   
   **Catatan:** Setelah update schema Prisma (misalnya untuk OAuth), jalankan migration:
   ```bash
   cd backend && npm run prisma:migrate
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

### Studios
- `GET /api/studios` — daftar studio milik/diikuti user (dengan pagination & search)
- `GET /api/studios/public` — showcase publik tersortir terbaru (dengan pagination & search)
- `GET /api/studios/insights/summary` — statistik studio/asset/comment milik user
- `POST /api/studios` — buat studio baru (role ADMIN/EDITOR, dengan plan limits)
- `GET /api/studios/:id` — detail studio lengkap (asset, komentar, anggota)
- `PATCH /api/studios/:id` — update studio (owner/admin studio)
- `DELETE /api/studios/:id` — hapus studio (owner/admin)

### Assets
- `POST /api/assets/upload` — unggah asset (validasi tipe & ukuran file)
- `GET /api/assets/studio/:studioId` — list assets dengan pagination & filter
- `DELETE /api/assets/:id` — hapus asset (uploader/owner/admin)

### Comments
- `GET /api/comments/studio/:studioId` — komentar dengan pagination & filter
- `POST /api/comments` — buat komentar baru
- `DELETE /api/comments/:id` — hapus komentar (author/owner/admin)

### Members (Studio Membership)
- `GET /api/members/studio/:studioId` — daftar anggota studio
- `POST /api/members/studio/:studioId` — tambah anggota baru (owner/admin studio)
- `PATCH /api/members/:memberId/studio/:studioId` — update role anggota
- `DELETE /api/members/:memberId/studio/:studioId` — hapus anggota

### Payments
- `POST /api/payments` — buat payment untuk subscription
- `GET /api/payments/my` — daftar payment user (dengan pagination)
- `GET /api/payments/:id` — detail payment
- `PUT /api/payments/:id/proof` — upload bukti pembayaran
- `PUT /api/payments/:id/verify` — verify payment (admin only)

## Catatan Auth
Contoh frontend menggunakan token dari `localStorage` (`muselab_token`). Untuk uji cepat, Anda bisa menyuntik token JWT manual:
```js
localStorage.setItem('muselab_token', '<Bearer JWT>');
```
Implementasi produksi sebaiknya memakai NextAuth/Clerk/Supabase Auth dan cookie httpOnly.

### OAuth Setup

#### Google OAuth
1. Buat project di [Google Cloud Console](https://console.cloud.google.com/)
2. Aktifkan Google+ API
3. Buat OAuth 2.0 Client ID
4. Tambahkan authorized redirect URIs: `http://localhost:3000`
5. Copy Client ID ke `NEXT_PUBLIC_GOOGLE_CLIENT_ID` di `frontend/.env.local`

#### GitHub OAuth
1. Buka [GitHub Developer Settings](https://github.com/settings/developers)
2. Klik "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Copy Client ID ke `NEXT_PUBLIC_GITHUB_CLIENT_ID` di `frontend/.env.local`
5. Copy Client Secret ke `GITHUB_CLIENT_SECRET` di `backend/.env`

### Endpoint Auth
- `POST /api/auth/register` — registrasi dengan email/password
- `POST /api/auth/login` — login dengan email/password
- `POST /api/auth/oauth` — login/register dengan OAuth (Google/GitHub)
- `GET /api/auth/github/callback` — callback handler untuk GitHub OAuth

## Fitur Utama

### Authentication & Authorization
- ✅ Email/Password registration & login
- ✅ OAuth (Google & GitHub)
- ✅ JWT-based authentication
- ✅ Role-based access control (ADMIN, EDITOR, VIEWER)
- ✅ Plan-based limits (FREE, PRO, ENTERPRISE)

### Studio Management
- ✅ Create, read, update, delete studios
- ✅ Studio visibility (PUBLIC, PRIVATE, INVITE)
- ✅ Studio membership management
- ✅ Member roles (ADMIN, EDITOR, VIEWER)
- ✅ Plan-based studio limits (FREE: 1 studio, 3 members)

### Asset Management
- ✅ Upload assets (AUDIO, IMAGE, TEXT)
- ✅ File size limits (AUDIO: 50MB, IMAGE: 10MB, TEXT: 5MB)
- ✅ File type validation
- ✅ Asset pagination & filtering
- ✅ Access control per studio

### Comments & Collaboration
- ✅ Real-time comments via Socket.io
- ✅ Comment pagination
- ✅ Asset-specific comments
- ✅ Access control

### Payment & Subscription
- ✅ Payment creation (MANDIRI, QRIS)
- ✅ Payment proof upload
- ✅ Admin payment verification
- ✅ Subscription management
- ✅ Plan upgrades

### Security & Performance
- ✅ Input validation (Zod)
- ✅ Rate limiting
- ✅ XSS protection
- ✅ SQL injection prevention
- ✅ File upload security
- ✅ Database indexes
- ✅ Pagination untuk semua list endpoints
- ✅ Search & filter capabilities

## Pengembangan Lanjut
- Ganti storage lokal ke Supabase/Firebase (lihat `backend/src/services/fileService.js`)
- Tambah waveform viewer untuk audio
- Tambah remix/fork functionality
- AI assist features
- Real-time collaboration improvements


