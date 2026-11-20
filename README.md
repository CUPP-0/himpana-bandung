# HIMPANA Bandung
Sistem administrasi internal HIMPANA Cabang Bandung. Next.js untuk frontend dan API backend, MySQL untuk database, satu role Admin.

## Modul
- Dashboard statistik anggota, KTA, data ulang dan pemasukan.
- Member: tambah manual, import/export Excel, pencarian dan filter.
- Iuran: pencatatan transfer/tunai per anggota per bulan/tahun, OCR bukti transfer berbantuan AI.
- Data ulang: filter dan ubah status YO, YWS, YWAC, YVKTR, YVPOS, YDPV, BWDU, BLMDU.
- WhatsApp: ucapan pembayaran ke grup dan notifikasi pribadi ketika status berubah menjadi YO.

## Instalasi
1. Node.js 20+, MySQL/MariaDB, phpMyAdmin.
2. npm install
3. Salin .env.example menjadi .env.local dan isi koneksi MySQL.
4. Import database/schema.sql melalui phpMyAdmin.
5. Buat hash admin: node -e "console.log(require('bcryptjs').hashSync('PASSWORD_ANDA',12))"
6. Jalankan INSERT admin sesuai komentar di schema.sql melalui phpMyAdmin.
7. npm run dev lalu buka http://localhost:3000/login

Atur FONNTE_TOKEN dan WHATSAPP_GROUP_ID untuk notifikasi WhatsApp. Atur OPENAI_API_KEY untuk OCR bukti transfer. Hasil OCR harus diperiksa Admin sebelum disimpan. Untuk produksi wajib gunakan HTTPS, JWT_SECRET acak yang kuat, backup database, dan batasi akses phpMyAdmin.
