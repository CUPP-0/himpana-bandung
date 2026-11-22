import {NextResponse} from "next/server";
import pool from "@/lib/db";
import {requireAdmin} from "@/lib/auth";

export async function GET(req) {
  try {
    await requireAdmin();
    const y = Number(new URL(req.url).searchParams.get("year") || new Date().getFullYear());
    const [data] = await pool.execute(
      "SELECT p.*, m.nama, m.nomor_anggota, m.nomor_pensiun FROM payments p JOIN members m ON m.id=p.member_id WHERE p.tahun=? ORDER BY p.tanggal_bayar DESC, p.id DESC",
      [y]
    );
    const [[sum]] = await pool.execute("SELECT COALESCE(SUM(nominal),0) total FROM payments WHERE tahun=? AND status='Sudah'", [y]);
    return NextResponse.json({data,total:Number(sum.total)});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:"Gagal mengambil transaksi"},{status:e?.message==="UNAUTHORIZED"?401:500});
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    const d = await req.json();
    if (!d.member_id || !d.bulan || !d.tahun || Number(d.nominal) <= 0 || !d.tanggal_bayar) {
      return NextResponse.json({error:"Lengkapi anggota, periode, nominal, dan tanggal pembayaran."},{status:400});
    }
    const [r] = await pool.execute(
      "INSERT INTO payments(member_id,bulan,tahun,nominal,metode,tanggal_bayar,status,bukti_path,catatan) VALUES(?,?,?,?,?,?,'Sudah',?,?)",
      [d.member_id,d.bulan,d.tahun,d.nominal,d.metode||"Tunai",d.tanggal_bayar,d.bukti_path||null,d.catatan||null]
    );
    const [[m]] = await pool.execute("SELECT nama FROM members WHERE id=?",[d.member_id]);
    let wa={sent:false,reason:"Notifikasi grup tidak diminta."};
    if(d.notify_group) {
      const [[setting]] = await pool.execute("SELECT setting_value FROM whatsapp_settings WHERE setting_key=? LIMIT 1",["iuran_notification_group"]).catch(async e=>{if(e?.code==="ER_NO_SUCH_TABLE")return [[null]];throw e;});
      const groupId=setting?.setting_value;
      if(!groupId) wa={sent:false,reason:"Belum ada grup notifikasi iuran yang dipilih."};
      else {
        const {sendWhatsApp,paymentMessage}=await import("@/lib/whatsapp");
        wa=await sendWhatsApp(groupId,paymentMessage(m.nama,Number(d.bulan)+" / "+d.tahun));
        await pool.execute("INSERT INTO whatsapp_logs(member_id,jenis,target,status,response) VALUES(?,?,?,?,?)",[d.member_id,"iuran_grup",groupId,wa.sent?"terkirim":"gagal",JSON.stringify(wa.reason||wa.id||{})]);
      }
    }
    return NextResponse.json({success:true,id:r.insertId,whatsapp:wa});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:e?.code==="ER_DUP_ENTRY"?"Anggota ini sudah memiliki pembayaran pada bulan dan tahun tersebut.":e?.message==="UNAUTHORIZED"?"Sesi login berakhir.":"Pembayaran gagal disimpan."},{status:e?.message==="UNAUTHORIZED"?401:500});
  }
}