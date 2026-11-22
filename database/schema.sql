CREATE DATABASE IF NOT EXISTS himpana_bandung CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE himpana_bandung;
CREATE TABLE admins(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,username VARCHAR(80) NOT NULL UNIQUE,password_hash VARCHAR(255) NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE members(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomor_anggota VARCHAR(80) NULL UNIQUE COMMENT 'Nomor KTA; NULL jika belum memiliki KTA',
  nomor_pensiun VARCHAR(80) NULL,
  nama VARCHAR(180) NOT NULL,
  no_wa VARCHAR(30),
  email VARCHAR(160),
  tanggal_lahir DATE NULL,
  alamat_lengkap TEXT NULL,
  kode_pos VARCHAR(10) NULL,
  kabupaten_id VARCHAR(20) NULL,
  kabupaten VARCHAR(120) NULL,
  kecamatan_id VARCHAR(20) NULL,
  kecamatan VARCHAR(120) NULL,
  kelurahan_id VARCHAR(20) NULL,
  kelurahan VARCHAR(120) NULL,
  status_kta ENUM('Sudah','Belum') NOT NULL DEFAULT 'Belum',
  status_data_ulang ENUM('YO','YWS','YWAC','YVKTR','YVPOS','YDPV','BWDU','BLMDU') NOT NULL DEFAULT 'BLMDU',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_members_nama(nama),
  INDEX idx_members_nomor_pensiun(nomor_pensiun),
  INDEX idx_members_status(status_kta,status_data_ulang)
) ENGINE=InnoDB;
CREATE TABLE payments(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,member_id BIGINT UNSIGNED NOT NULL,bulan TINYINT UNSIGNED NOT NULL,tahun SMALLINT UNSIGNED NOT NULL,nominal DECIMAL(15,2) NOT NULL,metode ENUM('Transfer','Tunai') NOT NULL DEFAULT 'Tunai',tanggal_bayar DATE NOT NULL,status ENUM('Sudah','Belum') NOT NULL DEFAULT 'Sudah',bukti_path VARCHAR(500),catatan TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY unique_member_period(member_id,bulan,tahun),FOREIGN KEY(member_id) REFERENCES members(id)) ENGINE=InnoDB;
CREATE TABLE data_ulang_history(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,member_id BIGINT UNSIGNED NOT NULL,status_sebelumnya VARCHAR(10),status_baru VARCHAR(10),catatan TEXT,changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE whatsapp_logs(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,member_id BIGINT UNSIGNED NULL,jenis VARCHAR(40),target VARCHAR(100),status VARCHAR(20),response JSON,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
-- Buat hash: node -e "console.log(require('bcryptjs').hashSync('PASSWORD_ANDA',12))"
-- INSERT INTO admins(username,password_hash) VALUES('admin','HASH_BCRYPT_DI_SINI');
