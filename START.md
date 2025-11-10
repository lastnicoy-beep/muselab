# Cara Menjalankan MuseLab

## Prasyarat
1. **Docker Desktop** harus berjalan (untuk Windows)
2. **Node.js 20+** (opsional, untuk development lokal)

## Menjalankan dengan Docker (Recommended)

### 1. Pastikan Docker Desktop berjalan
- Buka Docker Desktop
- Tunggu sampai status "Running"

### 2. Build dan jalankan semua service
```powershell
# Di PowerShell
Set-Location "C:\Users\perdh\OneDrive\Desktop\esawitt"
docker compose build
docker compose up -d
```

### 3. Cek status container
```powershell
docker compose ps
```

### 4. Akses aplikasi
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/health
- **Database**: localhost:5432 (user: muselab, password: muselab)

### 5. Lihat logs (jika ada masalah)
```powershell
# Semua service
docker compose logs -f

# Backend saja
docker compose logs -f backend

# Frontend saja
docker compose logs -f frontend

# Database saja
docker compose logs -f db
```

### 6. Stop semua service
```powershell
docker compose down
```

### 7. Stop dan hapus semua data
```powershell
docker compose down -v
```

## Menjalankan Secara Lokal (Tanpa Docker)

### Backend
```bash
cd backend
npm install
# Buat file .env dengan:
# DATABASE_URL="postgresql://muselab:muselab@localhost:5432/muselab?schema=public"
# JWT_SECRET="change_me_please"
# CORS_ORIGIN="http://localhost:3000"
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Buat file .env.local dengan:
# NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
npm run dev
```

## Troubleshooting

### Container tidak start
1. Cek Docker Desktop berjalan
2. Cek port 3000, 4000, 5432 tidak digunakan aplikasi lain
3. Restart Docker Desktop

### Database connection error
1. Pastikan container `muselab-postgres` running
2. Cek logs: `docker compose logs db`
3. Tunggu healthcheck selesai (biasanya 10-15 detik)

### Backend error
1. Cek logs: `docker compose logs backend`
2. Pastikan DATABASE_URL benar
3. Pastikan JWT_SECRET di-set

### Frontend tidak connect ke backend
1. Cek NEXT_PUBLIC_BACKEND_URL di docker-compose.yml
2. Cek CORS_ORIGIN di backend environment
3. Cek browser console untuk error CORS

### Upload file gagal
1. Pastikan directory `uploads/` ada di backend
2. Cek permission write di container
3. Cek logs backend untuk error detail

## Fitur yang Tersedia

✅ **Authentication**: Register & Login dengan JWT
✅ **Studio Management**: Buat, lihat, edit studio
✅ **Real-time Collaboration**: Socket.io untuk sinkronisasi
✅ **File Upload**: Audio, Image, Text documents
✅ **Comments**: Komentar real-time per studio
✅ **Canvas Notes**: Catatan kolaboratif real-time
✅ **Presence**: Lihat siapa yang online
✅ **Showcase**: Galeri studio publik

## Next Steps

1. Buat akun di http://localhost:3000/auth?mode=register
2. Buat studio pertama di http://localhost:3000/studios
3. Upload file dan mulai kolaborasi!

