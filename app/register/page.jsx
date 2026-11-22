"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Search } from "lucide-react";

const API = "https://www.emsifa.com/api-wilayah-indonesia/api";
const empty = { nama_lengkap:"", nomor_pensiun:"", nomor_kta:"", no_wa:"", tanggal_lahir:"", alamat_lengkap:"", kode_pos:"", provinsi_id:"32", provinsi:"Jawa Barat", kabupaten_id:"", kabupaten:"", kecamatan_id:"", kecamatan:"", kelurahan_id:"", kelurahan:"" };
const inputClass = "min-h-[43px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10 disabled:cursor-not-allowed disabled:bg-slate-100";
const labelClass = "mb-1.5 block text-[11px] font-bold text-slate-700";

export default function RegisterPage() {
  const [form,setForm] = useState(empty);
  const [regencies,setRegencies] = useState([]);
  const [districts,setDistricts] = useState([]);
  const [villages,setVillages] = useState([]);
  const [loading,setLoading] = useState(false);
  const [regionLoading,setRegionLoading] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);
  const change = (key,value) => setForm(old=>({...old,[key]:value}));

  useEffect(() => {
    fetch(API+"/regencies/32.json").then(r=>r.json()).then(data=>setRegencies(data.filter(x=>["3204","3217","3273","3277"].includes(x.id)))).catch(()=>setError("Daftar wilayah gagal dimuat. Muat ulang halaman."));
  }, []);

  async function loadRegion(url) {
    setRegionLoading(true); setError("");
    try { const response=await fetch(url); if(!response.ok) throw Error(); return await response.json(); }
    catch { setError("Daftar wilayah gagal dimuat. Silakan coba lagi."); return []; }
    finally { setRegionLoading(false); }
  }
  async function kabupatenChange(id) {
    const item=regencies.find(x=>x.id===id);
    setForm(old=>({...old,kabupaten_id:id,kabupaten:item?.name||"",kecamatan_id:"",kecamatan:"",kelurahan_id:"",kelurahan:""}));
    setDistricts([]);setVillages([]);
    if(id) setDistricts(await loadRegion(API+"/districts/"+id+".json"));
  }
  async function kecamatanChange(id) {
    const item=districts.find(x=>x.id===id);
    setForm(old=>({...old,kecamatan_id:id,kecamatan:item?.name||"",kelurahan_id:"",kelurahan:""}));
    setVillages([]);
    if(id) setVillages(await loadRegion(API+"/villages/"+id+".json"));
  }
  function kelurahanChange(id) {
    const item=villages.find(x=>x.id===id);
    setForm(old=>({...old,kelurahan_id:id,kelurahan:item?.name||""}));
  }
  async function submit(e) {
    e.preventDefault();setLoading(true);setError("");
    try {
      const response=await fetch("/api/data-ulang/request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=await response.json();
      if(!response.ok) throw Error(data.error||"Pendaftaran gagal dikirim.");
      setSuccess(true);window.scrollTo({top:0,behavior:"smooth"});
    } catch(e) {setError(e.message||"Terjadi kesalahan.");}
    finally {setLoading(false);}
  }

  return <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[41%_59%]">
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#102d55] text-white lg:block">
      <div className="absolute inset-0 bg-[url('/images/hero-pertamina.png')] bg-cover bg-center opacity-75"/>
      <div className="absolute inset-0 bg-gradient-to-b from-[#08284c]/55 via-[#0b3768]/55 to-[#061c38]/90"/>
      <div className="relative z-10 flex min-h-screen flex-col px-10 py-12 xl:px-16">
        <div className="mb-14"><h2 className="text-5xl font-black tracking-tight xl:text-6xl">TUTORIAL</h2><div className="mt-3 h-1 w-64 bg-white"/><p className="mt-3 text-2xl italic tracking-[.28em] text-blue-100">Data Ulang</p></div>
        <div className="space-y-10">
          {[
            ["1","Masukan Identitas Lengkap","Sesuai dengan kartu anggota atau identitas pensiunan"],
            ["2","Masukan Alamat lengkap","Masukkan alamat lengkap tempat tinggal Anda saat ini."],
            ["3", "Lacak Data Ulang", "Jika Nomor Pensiun Anda sudah terdaftar, periksa status dan perkembangan proses data ulang melalui fitur Tracking."],
          ].map(([number,title,desc])=><div key={number} className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 text-slate-900 shadow-xl"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-800 text-2xl font-extrabold text-white">{number}</span><span><b className="block text-sm">{title}</b><small className="mt-1 block text-xs leading-relaxed text-slate-600">{desc}</small></span></div>)}
        </div>
        <div className="mt-auto pt-12"><div className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-extrabold text-slate-900 shadow-xl"><ClipboardList size={21} className="text-blue-800"/> Daftar Data Ulang</div><p className="mt-8 text-xs leading-6 text-blue-100">HIMPANA · CABANG BANDUNG<br/>Peduli dan Melayani</p></div>
      </div>
    </aside>

    <section className="flex min-h-screen items-start justify-center bg-white px-4 py-7 sm:px-8 lg:items-center lg:overflow-y-auto lg:px-12 lg:py-10">
      <div className="w-full max-w-[650px]">
        <div className="mb-7 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-[#102d55]"><img className="h-9 w-24 object-contain object-left" src="https://himpana.com/logo-himpana.png" alt="Logo HIMPANA"/><span><b className="block text-sm font-extrabold">HIMPANA</b><small className="text-[10px] text-slate-500">Cabang Bandung</small></span></Link>
          <Link href="/" className="text-xs font-semibold text-blue-800 hover:text-blue-950"><ArrowLeft className="mr-1 inline" size={14}/> Kembali</Link>
        </div>
        <div className="mb-6"><span className="text-[10px] font-extrabold tracking-[1.8px] text-blue-800">LAYANAN ANGGOTA</span><h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">Daftar Data Ulang</h1><p className="mt-2 text-xs leading-6 text-slate-500">Lengkapi formulir berikut untuk memperbarui data keanggotaan HIMPANA Cabang Bandung.</p></div>
        {error&&<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}
        {success ? <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-sm leading-7 text-blue-950"><CheckCircle2 size={32} className="text-blue-800"/><h3 className="mt-3 text-lg font-extrabold">Pendaftaran berhasil!</h3>Data Anda sudah tersimpan di database anggota dengan status <b>BLMDU — Belum Data Ulang</b>. Gunakan nomor pensiun atau KTA dan nama lengkap untuk memantau prosesnya.<Link href="/tracking" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-xs font-bold text-white hover:bg-blue-900">Lacak Data Ulang <Search size={15}/></Link></div> : <form onSubmit={submit} className="space-y-5">
          <div><h2 className="mb-3 border-b border-slate-200 pb-2 text-sm font-extrabold text-[#102d55]">Identitas Pensiunan</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className={labelClass}>Nama Lengkap *</label><input className={inputClass} required value={form.nama_lengkap} onChange={e=>change("nama_lengkap",e.target.value)} placeholder="Nama sesuai identitas"/></div>
            <div><label className={labelClass}>Nomor Pensiun *</label><input className={inputClass} required value={form.nomor_pensiun} onChange={e=>change("nomor_pensiun",e.target.value)} placeholder="Masukkan nomor pensiun"/></div>
            <div><label className={labelClass}>Nomor KTA</label><input className={inputClass} value={form.nomor_kta} onChange={e=>change("nomor_kta",e.target.value)} placeholder="Kosongkan jika belum ada"/><p className="mt-1 text-[10px] text-slate-500">Opsional jika belum memiliki KTA.</p></div>
            <div><label className={labelClass}>Nomor WhatsApp *</label><input className={inputClass} required type="tel" value={form.no_wa} onChange={e=>change("no_wa",e.target.value)} placeholder="Contoh: 081234567890"/></div>
            <div><label className={labelClass}>Tanggal Lahir *</label><input className={inputClass} required type="date" value={form.tanggal_lahir} onChange={e=>change("tanggal_lahir",e.target.value)}/></div>
          </div></div>
          <div><h2 className="mb-3 border-b border-slate-200 pb-2 text-sm font-extrabold text-[#102d55]">Alamat Lengkap</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={labelClass}>Alamat / Jalan / Nomor Rumah *</label><textarea className={inputClass+" min-h-[76px] resize-y"} required value={form.alamat_lengkap} onChange={e=>change("alamat_lengkap",e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, dan detail lainnya"/></div>
            <div><label className={labelClass}>Kabupaten / Kota *</label><select className={inputClass} required disabled={regionLoading} value={form.kabupaten_id} onChange={e=>kabupatenChange(e.target.value)}><option value="">Pilih kabupaten/kota</option>{regencies.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kecamatan *</label><select className={inputClass} required disabled={!form.kabupaten_id||regionLoading} value={form.kecamatan_id} onChange={e=>kecamatanChange(e.target.value)}><option value="">Pilih kecamatan</option>{districts.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kelurahan / Desa *</label><select className={inputClass} required disabled={!form.kecamatan_id||regionLoading} value={form.kelurahan_id} onChange={e=>kelurahanChange(e.target.value)}><option value="">Pilih kelurahan/desa</option>{villages.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kode Pos *</label><input className={inputClass} required inputMode="numeric" maxLength={5} value={form.kode_pos} onChange={e=>change("kode_pos",e.target.value.replace(/\D/g,""))} placeholder="5 digit kode pos"/></div>
          </div></div>
          <p className="text-[10px] leading-5 text-slate-500">Dengan mengirim formulir ini, Anda menyatakan bahwa informasi yang diberikan benar dan dapat digunakan untuk administrasi serta verifikasi keanggotaan.</p>
          <button className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60" disabled={loading}>{loading?"Menyimpan data...":"Kirim Pendaftaran"} <ArrowRight size={15}/></button>
          <div className="text-center text-xs text-slate-500">Sudah mendaftar? <Link href="/tracking" className="font-bold text-blue-800 hover:underline">Lacak proses data ulang</Link></div>
        </form>}
      </div>
    </section>
  </main>;
}
