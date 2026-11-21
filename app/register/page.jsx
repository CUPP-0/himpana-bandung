"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const API = "https://www.emsifa.com/api-wilayah-indonesia/api";
const empty = { nama_lengkap:"", nomor_pensiun:"", nomor_kta:"", no_wa:"", tanggal_lahir:"", alamat_lengkap:"", kode_pos:"", provinsi_id:"", provinsi:"", kabupaten_id:"", kabupaten:"", kecamatan_id:"", kecamatan:"", kelurahan_id:"", kelurahan:"" };
const inputClass = "min-h-[44px] w-full rounded-lg border border-[#dfe8e1] bg-white px-3 py-2.5 text-xs text-[#263d2e] outline-none transition placeholder:text-[#a0aaa3] focus:border-[#6ca783] focus:ring-4 focus:ring-[#176f49]/10 disabled:cursor-not-allowed disabled:bg-[#f5f7f5]";
const labelClass = "mb-2 block text-[11px] font-bold text-[#53665a]";

export default function RegisterPage() {
  const [form,setForm] = useState(empty);
  const [provinces,setProvinces] = useState([]);
  const [regencies,setRegencies] = useState([]);
  const [districts,setDistricts] = useState([]);
  const [villages,setVillages] = useState([]);
  const [loading,setLoading] = useState(false);
  const [regionLoading,setRegionLoading] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);

  useEffect(()=>{ fetch(API+"/provinces.json").then(r=>r.json()).then(setProvinces).catch(()=>setError("Daftar provinsi gagal dimuat. Periksa koneksi internet.")); },[]);
  const change = (key,value) => setForm(old=>({...old,[key]:value}));
  async function loadRegion(url) {
    setRegionLoading(true); setError("");
    try { const data=await fetch(url).then(r=>{if(!r.ok)throw Error();return r.json()}); return data; }
    catch { setError("Daftar wilayah gagal dimuat. Silakan coba lagi."); return null; }
    finally { setRegionLoading(false); }
  }
  async function provinceChange(id) {
    const p=provinces.find(x=>x.id===id);
    setForm(old=>({...old,provinsi_id:id,provinsi:p?.name||"",kabupaten_id:"",kabupaten:"",kecamatan_id:"",kecamatan:"",kelurahan_id:"",kelurahan:""}));
    setRegencies([]);setDistricts([]);setVillages([]);
    if(id) setRegencies(await loadRegion(API+"/regencies/"+id+".json")||[]);
  }
  async function kabupatenChange(id) {
    const item=regencies.find(x=>x.id===id);
    setForm(old=>({...old,kabupaten_id:id,kabupaten:item?.name||"",kecamatan_id:"",kecamatan:"",kelurahan_id:"",kelurahan:""}));
    setDistricts([]);setVillages([]);
    if(id) setDistricts(await loadRegion(API+"/districts/"+id+".json")||[]);
  }
  async function kecamatanChange(id) {
    const item=districts.find(x=>x.id===id);
    setForm(old=>({...old,kecamatan_id:id,kecamatan:item?.name||"",kelurahan_id:"",kelurahan:""}));
    setVillages([]);
    if(id) setVillages(await loadRegion(API+"/villages/"+id+".json")||[]);
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
      if(!response.ok)throw Error(data.error||"Permohonan gagal dikirim.");
      setSuccess(true);window.scrollTo({top:0,behavior:"smooth"});
    } catch(e) {setError(e.message||"Terjadi kesalahan.");}
    finally {setLoading(false);}
  }

  return <main className="min-h-screen bg-[#f5f8f5] px-3 py-5 sm:px-5 sm:py-9">
    <div className="mx-auto w-full max-w-[850px]">
      <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[#173e2c]"><img className="h-10 w-[105px] object-contain object-left sm:h-12 sm:w-[132px]" src="https://himpana.com/logo-himpana.png" alt="Logo HIMPANA"/><span><strong className="block text-sm font-extrabold tracking-wide">HIMPANA</strong><small className="block text-[10px] text-[#75857b]">Cabang Bandung</small></span></Link>
        <Link href="/" className="shrink-0 text-[11px] font-bold text-[#34754e] sm:text-xs"><ArrowLeft className="mr-1 inline" size={14}/> Kembali ke Beranda</Link>
      </div>
      <form className="rounded-2xl border border-[#e5ece6] bg-white p-5 shadow-[0_15px_45px_#1c583010] sm:p-8" onSubmit={submit}>
        <span className="text-[10px] font-extrabold tracking-[1.7px] text-[#27784e]">LAYANAN ANGGOTA</span>
        <h1 className="mb-2 mt-4 text-2xl font-extrabold text-[#183d2a] sm:text-[26px]">Permohonan Data Ulang</h1>
        <p className="mb-6 text-xs leading-7 text-[#77857b]">Lengkapi informasi berikut dengan benar. Permohonan akan diterima oleh pengurus HIMPANA Cabang Bandung untuk proses verifikasi.</p>
        {error&&<div className="mb-4 rounded-lg bg-[#fff0ed] px-4 py-3 text-[11px] text-[#b04438]">{error}</div>}
        {success ? <div className="my-5 rounded-xl bg-[#eaf6ed] p-5 text-xs leading-7 text-[#246b43]"><CheckCircle2 size={26}/><h3 className="mt-3 text-base font-bold">Permohonan berhasil dikirim</h3>Terima kasih. Data Anda telah masuk dan menunggu verifikasi pengurus HIMPANA Cabang Bandung. Simpan informasi nomor pensiun Anda untuk keperluan tindak lanjut.</div> : <>
          <h3 className="mb-4 mt-6 border-b border-[#edf1ee] pb-3 text-[13px] font-bold text-[#276d46]">Identitas Pensiunan</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={labelClass}>Nama Lengkap *</label><input className={inputClass} required value={form.nama_lengkap} onChange={e=>change("nama_lengkap",e.target.value)} placeholder="Nama sesuai identitas"/></div>
            <div><label className={labelClass}>Nomor Pensiun *</label><input className={inputClass} required value={form.nomor_pensiun} onChange={e=>change("nomor_pensiun",e.target.value)} placeholder="Masukkan nomor pensiun"/></div>
            <div><label className={labelClass}>Nomor KTA</label><input className={inputClass} value={form.nomor_kta} onChange={e=>change("nomor_kta",e.target.value)} placeholder="Jika sudah memiliki KTA"/><p className="mt-1.5 text-[10px] text-[#87938b]">Kosongkan jika belum memiliki KTA.</p></div>
            <div><label className={labelClass}>Nomor WhatsApp *</label><input className={inputClass} required type="tel" value={form.no_wa} onChange={e=>change("no_wa",e.target.value)} placeholder="Contoh: 081234567890"/></div>
            <div><label className={labelClass}>Tanggal Lahir *</label><input className={inputClass} required type="date" value={form.tanggal_lahir} onChange={e=>change("tanggal_lahir",e.target.value)}/></div>
          </div>
          <h3 className="mb-4 mt-7 border-b border-[#edf1ee] pb-3 text-[13px] font-bold text-[#276d46]">Alamat Lengkap</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={labelClass}>Alamat / Jalan / Nomor Rumah *</label><textarea className={inputClass+" min-h-[85px] resize-y"} required value={form.alamat_lengkap} onChange={e=>change("alamat_lengkap",e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, blok, dan detail lainnya"/></div>
            <div><label className={labelClass}>Provinsi *</label><select className={inputClass} required value={form.provinsi_id} onChange={e=>provinceChange(e.target.value)}><option value="">Pilih provinsi</option>{provinces.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kabupaten / Kota *</label><select className={inputClass} required disabled={!form.provinsi_id||regionLoading} value={form.kabupaten_id} onChange={e=>kabupatenChange(e.target.value)}><option value="">Pilih kabupaten/kota</option>{regencies.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kecamatan *</label><select className={inputClass} required disabled={!form.kabupaten_id||regionLoading} value={form.kecamatan_id} onChange={e=>kecamatanChange(e.target.value)}><option value="">Pilih kecamatan</option>{districts.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kelurahan / Desa *</label><select className={inputClass} required disabled={!form.kecamatan_id||regionLoading} value={form.kelurahan_id} onChange={e=>kelurahanChange(e.target.value)}><option value="">Pilih kelurahan/desa</option>{villages.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className={labelClass}>Kode Pos *</label><input className={inputClass} required inputMode="numeric" maxLength={5} value={form.kode_pos} onChange={e=>change("kode_pos",e.target.value.replace(/\D/g,""))} placeholder="5 digit kode pos"/></div>
          </div>
          <div className="mt-5 text-[10px] leading-6 text-[#87938b]">Dengan mengirim permohonan ini, Anda menyatakan bahwa informasi yang diberikan benar dan bersedia data digunakan untuk keperluan administrasi serta verifikasi anggota HIMPANA Cabang Bandung.</div>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#176f49] px-5 py-4 text-xs font-extrabold text-white transition hover:bg-[#105a3b] disabled:cursor-wait disabled:opacity-60" disabled={loading}>{loading?"Mengirim permohonan...":"Kirim Permohonan Data Ulang"} <ArrowRight size={15}/></button>
        </>}
      </form>
    </div>
  </main>;
}
