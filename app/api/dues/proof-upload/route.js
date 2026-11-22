import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/auth";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";

export const runtime="nodejs";

export async function POST(req) {
  try {
    await requireAdmin();
    const form=await req.formData();
    const file=form.get("file");
    if(!file || typeof file.arrayBuffer!=="function" || !["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type)) {
      return NextResponse.json({error:"Bukti harus berupa JPG, PNG, WebP, atau PDF."},{status:400});
    }
    if(file.size>8*1024*1024) return NextResponse.json({error:"Ukuran bukti maksimal 8 MB."},{status:413});
    const ext=({ "image/jpeg":".jpg","image/png":".png","image/webp":".webp","application/pdf":".pdf" })[file.type];
    const dir=path.join(process.cwd(),"storage","payment-proofs");
    await mkdir(dir,{recursive:true});
    const name=randomUUID()+ext;
    await writeFile(path.join(dir,name),Buffer.from(await file.arrayBuffer()),{flag:"wx"});
    return NextResponse.json({success:true,bukti_path:name});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:e?.message==="UNAUTHORIZED"?"Sesi login berakhir.":"Gagal mengunggah bukti pembayaran."},{status:e?.message==="UNAUTHORIZED"?401:500});
  }
}