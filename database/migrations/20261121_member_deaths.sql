CREATE TABLE IF NOT EXISTS member_deaths (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(180) NOT NULL,
  nomor_pensiun VARCHAR(80) NULL,
  tanggal_meninggal DATE NOT NULL,
  keterangan TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_member_deaths_date (tanggal_meninggal),
  INDEX idx_member_deaths_name (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
