import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const d = await req.json();
    const areaMap = {
      "3204": "Kabupaten Bandung",
      "3217": "Kabupaten Bandung Barat",
      "3273": "Kota Bandung",
      "3277": "Kota Cimahi",
    };
    const kabupatenId = String(d.kabupaten_id || "");
    const kabupaten = areaMap[kabupatenId];

    if (!kabupaten) {
      return NextResponse.json({ error: "Wilayah kabupaten/kota hanya tersedia untuk area Bandung Raya." }, { status: 400 });
    }

    const required = ["nama_lengkap", "nomor_pensiun", "no_wa", "tanggal_lahir", "alamat_lengkap", "kode_pos", "kecamatan", "kelurahan"];
    for (const key of required) {
      if (!String(d[key] || "").trim()) {
        return NextResponse.json({ error: "Semua kolom bertanda wajib harus diisi." }, { status: 400 });
      }
    }

    if (!/^\d{5}$/.test(String(d.kode_pos))) {
      return NextResponse.json({ error: "Kode pos harus terdiri dari 5 angka." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d.tanggal_lahir))) {
      return NextResponse.json({ error: "Tanggal lahir tidak valid." }, { status: 400 });
    }

    const nama = String(d.nama_lengkap).trim();
    const nomorPensiun = String(d.nomor_pensiun).trim();
    const nomorKta = String(d.nomor_kta || "").trim() || null;
    const noWa = String(d.no_wa).trim();

    if (nomorKta) {
      const [existingKta] = await pool.execute(
        "SELECT id FROM members WHERE nomor_anggota = ? LIMIT 1",
        [nomorKta]
      );
      if (existingKta.length) {
        return NextResponse.json({ error: "Nomor KTA tersebut sudah terdaftar sebagai nomor anggota." }, { status: 409 });
      }
    }

    const [existingPensiun] = await pool.execute(
      "SELECT id FROM members WHERE nomor_pensiun = ? LIMIT 1",
      [nomorPensiun]
    );
    if (existingPensiun.length) {
      return NextResponse.json({ error: "Nomor pensiun tersebut sudah terdaftar." }, { status: 409 });
    }

    const [result] = await pool.execute(
      `INSERT INTO members (
        nomor_anggota, nama, no_wa, email, status_kta, status_data_ulang,
        nomor_pensiun, tanggal_lahir, alamat_lengkap, kode_pos,
        kabupaten_id, kabupaten, kecamatan_id, kecamatan, kelurahan_id, kelurahan
      ) VALUES (?, ?, ?, NULL, ?, 'BLMDU', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomorKta,
        nama,
        noWa,
        nomorKta ? "Sudah" : "Belum",
        nomorPensiun,
        d.tanggal_lahir,
        String(d.alamat_lengkap).trim(),
        String(d.kode_pos).trim(),
        kabupatenId,
        kabupaten,
        d.kecamatan_id ? String(d.kecamatan_id) : null,
        String(d.kecamatan).trim(),
        d.kelurahan_id ? String(d.kelurahan_id) : null,
        String(d.kelurahan).trim(),
      ]
    );

    return NextResponse.json({
      success: true,
      member_id: result.insertId,
      message: "Pendaftaran berhasil. Data Anda sudah tersimpan sebagai anggota HIMPANA Cabang Bandung dengan status BLMDU.",
    }, { status: 201 });
  } catch (error) {
    console.error("Register member error:", error);
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Nomor KTA atau nomor pensiun tersebut sudah terdaftar." }, { status: 409 });
    }
    return NextResponse.json({ error: "Pendaftaran belum dapat disimpan. Silakan coba kembali." }, { status: 500 });
  }
}
