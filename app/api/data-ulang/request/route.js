import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const d = await req.json();
    const required = ["nama_lengkap","nomor_pensiun","no_wa","tanggal_lahir","alamat_lengkap","kode_pos","provinsi","kabupaten","kecamatan","kelurahan"];
    for (const key of required) {
      if (!String(d[key] || "").trim()) return NextResponse.json({error:"Semua kolom bertanda wajib harus diisi."},{status:400});
    }
    if (!/^\d{5}$/.test(String(d.kode_pos))) return NextResponse.json({error:"Kode pos harus terdiri dari 5 angka."},{status:400});
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d.tanggal_lahir))) return NextResponse.json({error:"Tanggal lahir tidak valid."},{status:400});
    await pool.query(`
      CREATE TABLE IF NOT EXISTS data_ulang_requests (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nama_lengkap VARCHAR(180) NOT NULL,
        nomor_pensiun VARCHAR(80) NOT NULL,
        nomor_kta VARCHAR(80) NULL,
        no_wa VARCHAR(30) NOT NULL,
        tanggal_lahir DATE NOT NULL,
        alamat_lengkap TEXT NOT NULL,
        kode_pos VARCHAR(10) NOT NULL,
        provinsi_id VARCHAR(20), provinsi VARCHAR(100) NOT NULL,
        kabupaten_id VARCHAR(20), kabupaten VARCHAR(120) NOT NULL,
        kecamatan_id VARCHAR(20), kecamatan VARCHAR(120) NOT NULL,
        kelurahan_id VARCHAR(20), kelurahan VARCHAR(120) NOT NULL,
        status ENUM('Menunggu','Disetujui','Ditolak') NOT NULL DEFAULT 'Menunggu',
        catatan_admin TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_request_nomor_pensiun(nomor_pensiun),
        INDEX idx_request_status(status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    const [existing] = await pool.execute("SELECT id FROM data_ulang_requests WHERE nomor_pensiun=? AND status='Menunggu' LIMIT 1",[String(d.nomor_pensiun).trim()]);
    if (existing.length) return NextResponse.json({error:"Permohonan dengan nomor pensiun tersebut masih menunggu verifikasi."},{status:409});
    const [result] = await pool.execute(`
      INSERT INTO data_ulang_requests
      (nama_lengkap,nomor_pensiun,nomor_kta,no_wa,tanggal_lahir,alamat_lengkap,kode_pos,provinsi_id,provinsi,kabupaten_id,kabupaten,kecamatan_id,kecamatan,kelurahan_id,kelurahan)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,[
      String(d.nama_lengkap).trim(),String(d.nomor_pensiun).trim(),String(d.nomor_kta||"").trim()||null,
      String(d.no_wa).trim(),d.tanggal_lahir,String(d.alamat_lengkap).trim(),String(d.kode_pos),
      d.provinsi_id||null,d.provinsi,d.kabupaten_id||null,d.kabupaten,d.kecamatan_id||null,d.kecamatan,d.kelurahan_id||null,d.kelurahan
    ]);
    return NextResponse.json({success:true,id:result.insertId,message:"Permohonan berhasil dikirim dan menunggu verifikasi."},{status:201});
  } catch (error) {
    console.error("Data ulang request error:",error);
    return NextResponse.json({error:"Permohonan belum dapat disimpan. Silakan coba kembali."},{status:500});
  }
}