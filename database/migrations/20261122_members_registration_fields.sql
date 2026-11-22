-- Tambahkan kolom data pendaftaran ulang langsung ke tabel members.
-- Jalankan satu kali pada database HIMPANA Bandung yang sudah berjalan.
ALTER TABLE members
  ADD COLUMN nomor_pensiun VARCHAR(80) NULL AFTER nomor_anggota,
  ADD COLUMN tanggal_lahir DATE NULL AFTER email,
  ADD COLUMN alamat_lengkap TEXT NULL AFTER tanggal_lahir,
  ADD COLUMN kode_pos VARCHAR(10) NULL AFTER alamat_lengkap,
  ADD COLUMN kabupaten_id VARCHAR(20) NULL AFTER kode_pos,
  ADD COLUMN kabupaten VARCHAR(120) NULL AFTER kabupaten_id,
  ADD COLUMN kecamatan_id VARCHAR(20) NULL AFTER kabupaten,
  ADD COLUMN kecamatan VARCHAR(120) NULL AFTER kecamatan_id,
  ADD COLUMN kelurahan_id VARCHAR(20) NULL AFTER kecamatan,
  ADD COLUMN kelurahan VARCHAR(120) NULL AFTER kelurahan_id,
  ADD INDEX idx_members_nomor_pensiun (nomor_pensiun);
