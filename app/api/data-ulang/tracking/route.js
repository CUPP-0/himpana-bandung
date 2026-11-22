import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const d = await req.json();
    const nomor = String(d.nomor || "").trim();
    if (!nomor) {
      return NextResponse.json({ error: "Nomor pensiun atau nomor KTA wajib diisi." }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT id, nama, nomor_pensiun, nomor_anggota, status_data_ulang, created_at, updated_at
       FROM members
       WHERE nomor_pensiun = ? OR nomor_anggota = ?
       LIMIT 1`,
      [nomor, nomor]
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Data tidak ditemukan. Periksa kembali nomor pensiun atau nomor KTA Anda." }, { status: 404 });
    }

    const member = rows[0];
    const [history] = await pool.execute(
      `SELECT status_sebelumnya, status_baru, catatan, changed_at
       FROM data_ulang_history WHERE member_id = ? ORDER BY changed_at ASC, id ASC`,
      [member.id]
    );
    return NextResponse.json({
      success: true,
      data: {
        nama: member.nama,
        nomor_pensiun: member.nomor_pensiun,
        nomor_anggota: member.nomor_anggota,
        status: member.status_data_ulang,
        created_at: member.created_at,
        updated_at: member.updated_at,
        history,
      },
    });
  } catch (error) {
    console.error("Track data ulang error:", error);
    return NextResponse.json({ error: "Tracking belum dapat dilakukan. Silakan coba kembali." }, { status: 500 });
  }
}
