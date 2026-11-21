import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
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