import {NextResponse} from "next/server";
import pool from "@/lib/db";
import {requireAdmin} from "@/lib/auth";

export async function PATCH(req,{params}) {
  try {
    await requireAdmin();
    const {id}=await params;
    const d=await req.json();
    if(!d.tanggal_bayar || !d.bulan || !d.tahun || Number(d.nominal)<=0) return NextResponse.json({error:"Tanggal, periode, dan nominal wajib diisi."},{status:400});
    const [r]=await pool.execute(
      "UPDATE payments SET bulan=?,tahun=?,nominal=?,metode=?,tanggal_bayar=?,bukti_path=COALESCE(?,bukti_path),catatan=? WHERE id=?",
      [d.bulan,d.tahun,d.nominal,d.metode||"Tunai",d.tanggal_bayar,d.bukti_path||null,d.catatan||null,id]
    );
    if(!r.affectedRows) return NextResponse.json({error:"Transaksi tidak ditemukan."},{status:404});
    return NextResponse.json({success:true});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:e?.code==="ER_DUP_ENTRY"?"Periode pembayaran tersebut sudah digunakan anggota ini.":e?.message==="UNAUTHORIZED"?"Sesi login berakhir.":"Gagal memperbarui pembayaran."},{status:e?.message==="UNAUTHORIZED"?401:500});
  }
}