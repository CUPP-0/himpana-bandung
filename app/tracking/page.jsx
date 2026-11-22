"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ClipboardCheck, Clock3, CheckCircle2, FileSearch } from "lucide-react";

const labels = { YO:"Yes Open", YWS:"Yes WS.", YWAC:"Yes WA Center", YVKTR:"Yes Via Ktr DAPEN", YVPOS:"Yes Via Pos", YDPV:"Dalam Proses Verifikasi", BWDU:"Belum Wajib Data Ulang", BLMDU:"Belum Data Ulang" };
const descriptions = {
  YO:"Data ulang Anda telah masuk pada status Yes Open.",
  YWS:"Data ulang Anda tercatat pada status Yes WS.",
  YWAC:"Data ulang Anda tercatat pada status Yes WA Center.",
  YVKTR:"Data ulang Anda tercatat pada status Yes Via Kantor DAPEN.",
  YVPOS:"Data ulang Anda tercatat pada status Yes Via Pos.",
  YDPV:"Data Anda sedang dalam proses verifikasi pengurus.",
  BWDU:"Saat ini Anda tercatat belum wajib melakukan data ulang.",
  BLMDU:"Data Anda sudah terdaftar, tetapi proses data ulang belum dimulai atau belum diperbarui.",
};
const date = value => value ? new Date(value).toLocaleString("id-ID",{dateStyle:"long",timeStyle:"short"}) : "-";

export default function TrackingPage() {
  const [nomor,setNomor]=useState("");
  const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [result,setResult]=useState(null);
  async function submit(e) {
    e.preventDefault();setLoading(true);setError("");setResult(null);
    try {
      const response=await fetch("/api/data-ulang/tracking",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nomor})});
      const data=await response.json();if(!response.ok)throw Error(data.error||"Data tidak ditemukan.");setResult(data.data);
    } catch(e) {setError(e.message||"Terjadi kesalahan.");} finally {setLoading(false);}
  }
  return <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[41%_59%]">
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#102d55] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div className="absolute inset-0 bg-[url('/images/hero-pertamina.png')] bg-cover bg-center opacity-70"/><div className="absolute inset-0 bg-gradient-to-b from-[#08284c]/55 to-[#061c38]/90"/>
      <div className="relative z-10"><h1 className="text-5xl font-black xl:text-6xl">TRACKING</h1><div className="mt-3 h-1 w-64 bg-white"/><p className="mt-3 text-2xl italic tracking-[.2em] text-blue-100">Data Ulang</p></div>
      <div className="relative z-10 space-y-5">
        <div className="rounded-xl bg-white p-5 text-slate-900 shadow-xl"><b className="flex items-center gap-2 text-sm"><Search size={18} className="text-blue-800"/> Cari data keanggotaan</b><p className="mt-2 text-xs leading-6 text-slate-600">Masukkan nomor pensiun atau nomor KTA yang terdaftar.</p></div>
        <div className="rounded-xl bg-white p-5 text-slate-900 shadow-xl"><b className="flex items-center gap-2 text-sm"><ClipboardCheck size={18} className="text-blue-800"/> Pantau status terbaru</b><p className="mt-2 text-xs leading-6 text-slate-600">Lihat status data ulang dan riwayat perubahan status yang dicatat pengurus.</p></div>
      </div>
      <p className="relative z-10 text-xs leading-6 text-blue-100">HIMPANA · CABANG BANDUNG<br/>Peduli dan Melayani</p>
    </aside>
    <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-10">
      <div className="w-full max-w-[520px]">
        <div className="mb-10 flex items-center justify-between"><Link href="/" className="flex items-center gap-3 text-[#102d55]"><img className="h-9 w-24 object-contain object-left" src="https://himpana.com/logo-himpana.png" alt="Logo HIMPANA"/><span><b className="block text-sm font-extrabold">HIMPANA</b><small className="text-[10px] text-slate-500">Cabang Bandung</small></span></Link><Link href="/register" className="text-xs font-semibold text-blue-800"><ArrowLeft className="mr-1 inline" size={14}/> Daftar</Link></div>
        <div className="mb-7 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-800"><FileSearch size={27}/></span><h2 className="mt-5 text-2xl font-extrabold text-slate-900">Lacak Data Ulang</h2><p className="mt-2 text-xs leading-6 text-slate-500">Masukkan nomor pensiun atau nomor KTA untuk melihat proses data ulang Anda.</p></div>
        <form onSubmit={submit} className="space-y-4">
          
          <div><label className="mb-2 block text-[11px] font-bold text-slate-700">Nomor Pensiun / Nomor KTA</label><input required value={nomor} onChange={e=>setNomor(e.target.value)} placeholder="Masukkan salah satu nomor" className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10"/></div>
          {error&&<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
          <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-800 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60">{loading?"Mencari data...":"Lacak Sekarang"} <Search size={16}/></button>
        </form>
        {result&&<div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-800">Hasil Tracking</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{result.nama}</h3><p className="mt-1 text-[11px] text-slate-500">No. Pensiun: {result.nomor_pensiun||"-"} · KTA: {result.nomor_anggota||"-"}</p></div><span className="rounded-full bg-blue-800 px-3 py-1.5 text-[10px] font-extrabold text-white">{result.status}</span></div>
          <div className="mt-4 rounded-xl bg-white p-4"><p className="text-sm font-extrabold text-[#102d55]">{labels[result.status]||result.status}</p><p className="mt-1 text-xs leading-5 text-slate-600">{descriptions[result.status]||"Status data ulang Anda telah diperbarui."}</p><p className="mt-3 text-[10px] text-slate-400">Pembaruan terakhir: {date(result.updated_at)}</p></div>
          <div className="mt-5"><h4 className="mb-3 flex items-center gap-2 text-xs font-extrabold text-slate-800"><Clock3 size={15}/> Riwayat Proses</h4><div className="space-y-3">
            <div className="flex gap-3"><span className="mt-0.5 text-blue-800"><CheckCircle2 size={17}/></span><div><p className="text-xs font-bold text-slate-800">Data terdaftar di sistem</p><p className="mt-0.5 text-[10px] text-slate-500">{date(result.created_at)}</p></div></div>
            {result.history?.map((item,index)=><div key={index} className="flex gap-3"><span className="mt-0.5 text-blue-800"><CheckCircle2 size={17}/></span><div><p className="text-xs font-bold text-slate-800">{labels[item.status_sebelumnya]||"Status awal"} → {labels[item.status_baru]||item.status_baru}</p><p className="mt-0.5 text-[10px] text-slate-500">{date(item.changed_at)}</p>{item.catatan&&<p className="mt-1 text-[10px] text-slate-600">{item.catatan}</p>}</div></div>)}
          </div></div>
        </div>}
        <p className="mt-7 text-center text-xs text-slate-500">Belum mengisi data ulang? <Link href="/register" className="font-bold text-blue-800 hover:underline">Daftar sekarang</Link></p>
      </div>
    </section>
  </main>;
}
