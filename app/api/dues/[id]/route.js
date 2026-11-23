import {NextResponse} from "next/server";
import pool from "@/lib/db";
import {requireAdmin} from "@/lib/auth";

export async function PATCH(req,{params}) {
  try {
    await requireAdmin();
    const {id}=await params;
    const d=await req.json();
    const tanggal=String(d.tanggal_bayar||"");
    const tanggalValid=/^\d{4}-\d{2}-\d{2}$/.test(tanggal) && !Number.isNaN(Date.parse(tanggal));
    if(!tanggalValid || Number(d.nominal)<=0) return NextResponse.json({error:"Tanggal dan nominal wajib diisi dengan benar."},{status:400});
    const bulan=Number(tanggal.slice(5,7));
    const tahun=Number(tanggal.slice(0,4));
    const [r]=await pool.execute(
      "UPDATE payments SET bulan=?,tahun=?,nominal=?,metode=?,tanggal_bayar=?,bukti_path=COALESCE(?,bukti_path),catatan=? WHERE id=?",
      [bulan,tahun,d.nominal,d.metode||"Tunai",tanggal,d.bukti_path||null,d.catatan||null,id]
    );
    if(!r.affectedRows) return NextResponse.json({error:"Transaksi tidak ditemukan."},{status:404});
    return NextResponse.json({success:true});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:e?.code==="ER_DUP_ENTRY"?"Periode pembayaran tersebut sudah digunakan anggota ini.":e?.message==="UNAUTHORIZED"?"Sesi login berakhir.":"Gagal memperbarui pembayaran."},{status:e?.message==="UNAUTHORIZED"?401:500});
  }
}