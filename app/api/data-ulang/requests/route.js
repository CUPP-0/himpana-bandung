import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS data_ulang_requests (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nama_lengkap VARCHAR(180) NOT NULL, nomor_pensiun VARCHAR(80) NOT NULL,
        nomor_kta VARCHAR(80) NULL, no_wa VARCHAR(30) NOT NULL, tanggal_lahir DATE NOT NULL,
        alamat_lengkap TEXT NOT NULL, kode_pos VARCHAR(10) NOT NULL,
        provinsi_id VARCHAR(20), provinsi VARCHAR(100) NOT NULL,
        kabupaten_id VARCHAR(20), kabupaten VARCHAR(120) NOT NULL,
        kecamatan_id VARCHAR(20), kecamatan VARCHAR(120) NOT NULL,
        kelurahan_id VARCHAR(20), kelurahan VARCHAR(120) NOT NULL,
        status ENUM('Menunggu','Disetujui','Ditolak') NOT NULL DEFAULT 'Menunggu',
        catatan_admin TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_request_nomor_pensiun(nomor_pensiun), INDEX idx_request_status(status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    const [data] = await pool.query("SELECT * FROM data_ulang_requests ORDER BY FIELD(status,'Menunggu','Disetujui','Ditolak'), created_at DESC LIMIT 500");
    return NextResponse.json({data});
  } catch (error) {
    console.error("Load data ulang requests:",error);
    return NextResponse.json({error:"Gagal mengambil permohonan data ulang."},{status:500});
  }
}

export async function PATCH(req) {
  try {
    await requireAdmin();
    const d = await req.json();
    if (!Number.isInteger(Number(d.id)) || !["Menunggu","Disetujui","Ditolak"].includes(d.status)) {
      return NextResponse.json({error:"Permintaan perubahan tidak valid."},{status:400});
    }
    const [result] = await pool.execute("UPDATE data_ulang_requests SET status=?,catatan_admin=? WHERE id=?",[
      d.status,String(d.catatan_admin||"").trim()||null,Number(d.id)
    ]);
    if (!result.affectedRows) return NextResponse.json({error:"Permohonan tidak ditemukan."},{status:404});
    return NextResponse.json({success:true});
  } catch (error) {
    console.error("Update data ulang request:",error);
    return NextResponse.json({error:"Gagal memperbarui permohonan."},{status:500});
  }
}