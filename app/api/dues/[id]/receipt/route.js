import {NextResponse} from "next/server";
import pool from "@/lib/db";
import {requireAdmin} from "@/lib/auth";

export const runtime="nodejs";

function pdfEscape(value) {
  return String(value ?? "-").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\x7E]/g," ").replace(/([\\()])/g,"\\$1");
}
function terbilang(value) {
  const words=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];
  const n=Math.floor(Math.abs(Number(value)||0));
  if(n<12)return words[n];
  if(n<20)return terbilang(n-10)+" belas";
  if(n<100)return terbilang(Math.floor(n/10))+" puluh "+terbilang(n%10);
  if(n<200)return "seratus "+terbilang(n-100);
  if(n<1000)return terbilang(Math.floor(n/100))+" ratus "+terbilang(n%100);
  if(n<2000)return "seribu "+terbilang(n-1000);
  if(n<1000000)return terbilang(Math.floor(n/1000))+" ribu "+terbilang(n%1000);
  if(n<1000000000)return terbilang(Math.floor(n/1000000))+" juta "+terbilang(n%1000000);
  return String(n);
}
function makePdf(lines) {
  const commands=["BT","/F1 18 Tf","50 790 Td"];
  lines.forEach((line,i)=>{if(i) commands.push("0 -27 Td");commands.push((i===0?"/F1 18 Tf":"/F1 11 Tf"));commands.push("("+pdfEscape(line)+") Tj");});
  commands.push("ET");
  const stream=commands.join("\n");
  const objects=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length "+Buffer.byteLength(stream,"ascii")+" >>\nstream\n"+stream+"\nendstream"
  ];
  let out="%PDF-1.4\n";
  const offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(out,"ascii"));out+=(i+1)+" 0 obj\n"+obj+"\nendobj\n";});
  const xref=Buffer.byteLength(out,"ascii");
  out+="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";
  for(let i=1;i<offsets.length;i++) out+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  out+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF";
  return Buffer.from(out,"ascii");
}

export async function GET(req,{params}) {
  try {
    await requireAdmin();
    const {id}=await params;
    const [[p]]=await pool.execute("SELECT p.*,m.nama,m.nomor_pensiun,m.nomor_anggota FROM payments p JOIN members m ON m.id=p.member_id WHERE p.id=? LIMIT 1",[id]);
    if(!p) return NextResponse.json({error:"Transaksi tidak ditemukan."},{status:404});
    const date=new Date(p.tanggal_bayar);
    const tanggal=Number.isNaN(date.getTime())?String(p.tanggal_bayar):new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"long",year:"numeric",timeZone:"UTC"}).format(date);
    const uang=new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(p.nominal));
    const pdf=makePdf([
      "KUITANSI PEMBAYARAN IURAN",
      "HIMPANA CABANG BANDUNG",
      " ",
      "No. Kuitansi: HMP-"+String(p.tahun)+"-"+String(p.id).padStart(5,"0"),
      "Telah diterima dari: "+p.nama,
      "Nomor Pensiun: "+(p.nomor_pensiun||"-"),
      "Nomor KTA: "+(p.nomor_anggota||"-"),
      "Jumlah: "+uang,
      "Terbilang: "+terbilang(p.nominal).trim()+" rupiah",
      "Untuk pembayaran iuran bulan: "+p.bulan+" / "+p.tahun,
      "Tanggal pembayaran: "+tanggal,
      "Metode pembayaran: "+p.metode,
      "Status: LUNAS",
      " ",
      "Bandung, "+tanggal,
      "Petugas / Administrator,",
      " ",
      " ",
      "(________________________)"
    ]);
    return new NextResponse(pdf,{headers:{"Content-Type":"application/pdf","Content-Disposition":'inline; filename="kuitansi-iuran-'+p.id+'.pdf"',"Cache-Control":"private, no-store"}});
  } catch(e) {
    if(e?.message==="UNAUTHORIZED") return NextResponse.json({error:"Tidak diizinkan."},{status:401});
    console.error(e);
    return NextResponse.json({error:"Gagal membuat kuitansi."},{status:500});
  }
}