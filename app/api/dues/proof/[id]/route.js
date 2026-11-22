import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/auth";
import pool from "@/lib/db";
import {readFile} from "node:fs/promises";
import path from "node:path";

export const runtime="nodejs";

export async function GET(req,{params}) {
  try {
    await requireAdmin();
    const {id}=await params;
    const [[row]]=await pool.execute("SELECT bukti_path FROM payments WHERE id=? LIMIT 1",[id]);
    if(!row?.bukti_path) return NextResponse.json({error:"Bukti pembayaran tidak tersedia."},{status:404});
    const name=path.basename(row.bukti_path);
    const filePath=path.join(process.cwd(),"storage","payment-proofs",name);
    const bytes=await readFile(filePath);
    const ext=path.extname(name).toLowerCase();
    const type=ext===".pdf"?"application/pdf":ext===".png"?"image/png":ext===".webp"?"image/webp":"image/jpeg";
    return new NextResponse(bytes,{headers:{"Content-Type":type,"Content-Disposition":"inline","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch(e) {
    if(e?.message==="UNAUTHORIZED") return NextResponse.json({error:"Tidak diizinkan."},{status:401});
    if(e?.code==="ENOENT") return NextResponse.json({error:"File bukti tidak ditemukan di penyimpanan server."},{status:404});
    console.error(e);
    return NextResponse.json({error:"Gagal membuka bukti."},{status:500});
  }
}