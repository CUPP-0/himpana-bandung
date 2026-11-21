"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const API = "https://www.emsifa.com/api-wilayah-indonesia/api";
const empty = { nama_lengkap:"", nomor_pensiun:"", nomor_kta:"", no_wa:"", tanggal_lahir:"", alamat_lengkap:"", kode_pos:"", provinsi_id:"", provinsi:"", kabupaten_id:"", kabupaten:"", kecamatan_id:"", kecamatan:"", kelurahan_id:"", kelurahan:"" };

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
  async function chooseRegion(type,id) {
    setRegionLoading(true); setError("");
    try {
      const names = {regencies:"kabupaten",districts:"kecamatan",villages:"kelurahan"};
      const key = names[type];
      const data = await fetch(API+"/"+type+"/"+id+".json").then(r=>{if(!r.ok)throw Error();return r.json()});
      if(type==="regencies"){setRegencies(data);setDistricts([]);setVillages([]);setForm(old=>({...old,kabupaten_id:id,kabupaten:data.find(x=>x.id===id)?.name||"",kecamatan_id:"",kecamatan:"",kelurahan_id:"",kelurahan:""}));}
      if(type==="districts"){setDistricts(data);setVillages([]);setForm(old=>({...old,kecamatan_id:id,kecamatan:data.find(x=>x.id===id)?.name||"",kelurahan_id:"",kelurahan:""}));}
      if(type==="villages"){setForm(old=>({...old,kelurahan_id:id,kelurahan:data.find(x=>x.id===id)?.name||""}));}
    } catch { setError("Daftar wilayah gagal dimuat. Silakan coba lagi."); }
    finally {setRegionLoading(false);}
  }
  function provinceChange(id) {
    const p=provinces.find(x=>x.id===id);
    setForm(old=>({...old,provinsi_id:id,provinsi:p?.name||"",kabupaten_id:"",kabupaten:"",kecamatan_id:"",kecamatan:"",kelurahan_id:"",kelurahan:""}));
    setRegencies([]);setDistricts([]);setVillages([]);
    if(id) chooseRegion("regencies",id);
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

  return <main className="register-page"><div className="register-wrap">
    <div className="register-top"><Link href="/" className="public-brand"><span className="public-brand-mark">H</span><span><strong>HIMPANA</strong><small>Cabang Bandung</small></span></Link><Link href="/"><ArrowLeft size={14} style={{verticalAlign:"middle",marginRight:5}}/> Kembali ke Beranda</Link></div>
    <form className="register-card" onSubmit={submit}>
      <span className="section-kicker">LAYANAN ANGGOTA</span>
      <h1>Permohonan Data Ulang</h1>
      <p>Lengkapi informasi berikut dengan benar. Permohonan akan diterima oleh pengurus HIMPANA Cabang Bandung untuk proses verifikasi.</p>
      {error&&<div className="register-alert">{error}</div>}
      {success ? <div className="register-success"><CheckCircle2 size={25}/><h3>Permohonan berhasil dikirim</h3>Terima kasih. Data Anda telah masuk dan menunggu verifikasi pengurus HIMPANA Cabang Bandung. Simpan informasi nomor pensiun Anda untuk keperluan tindak lanjut.</div> : <>
        <h3 className="register-section-title">Identitas Pensiunan</h3>
        <div className="register-grid">
          <div className="register-field"><label>Nama Lengkap *</label><input required value={form.nama_lengkap} onChange={e=>change("nama_lengkap",e.target.value)} placeholder="Nama sesuai identitas"/></div>
          <div className="register-field"><label>Nomor Pensiun *</label><input required value={form.nomor_pensiun} onChange={e=>change("nomor_pensiun",e.target.value)} placeholder="Masukkan nomor pensiun"/></div>
          <div className="register-field"><label>Nomor KTA</label><input value={form.nomor_kta} onChange={e=>change("nomor_kta",e.target.value)} placeholder="Jika sudah memiliki KTA"/><div className="register-hint">Kosongkan jika belum memiliki KTA.</div></div>
          <div className="register-field"><label>Nomor WhatsApp *</label><input required type="tel" value={form.no_wa} onChange={e=>change("no_wa",e.target.value)} placeholder="Contoh: 081234567890"/></div>
          <div className="register-field"><label>Tanggal Lahir *</label><input required type="date" value={form.tanggal_lahir} onChange={e=>change("tanggal_lahir",e.target.value)}/></div>
        </div>
        <h3 className="register-section-title">Alamat Lengkap</h3>
        <div className="register-grid">
          <div className="register-field full"><label>Alamat / Jalan / Nomor Rumah *</label><textarea required value={form.alamat_lengkap} onChange={e=>change("alamat_lengkap",e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, blok, dan detail lainnya"/></div>
          <div className="register-field"><label>Provinsi *</label><select required value={form.provinsi_id} onChange={e=>provinceChange(e.target.value)}><option value="">Pilih provinsi</option>{provinces.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div className="register-field"><label>Kabupaten / Kota *</label><select required disabled={!form.provinsi_id||regionLoading} value={form.kabupaten_id} onChange={e=>chooseRegion("districts",e.target.value).then(()=>{})}><option value="">Pilih kabupaten/kota</option>{regencies.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div className="register-field"><label>Kecamatan *</label><select required disabled={!form.kabupaten_id||regionLoading} value={form.kecamatan_id} onChange={e=>chooseRegion("villages",e.target.value)}><option value="">Pilih kecamatan</option>{districts.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div className="register-field"><label>Kelurahan / Desa *</label><select required disabled={!form.kecamatan_id||regionLoading} value={form.kelurahan_id} onChange={e=>{const x=villages.find(v=>v.id===e.target.value);change("kelurahan_id",e.target.value);change("kelurahan",x?.name||"");}}><option value="">Pilih kelurahan/desa</option>{villages.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div className="register-field"><label>Kode Pos *</label><input required inputMode="numeric" maxLength={5} value={form.kode_pos} onChange={e=>change("kode_pos",e.target.value.replace(/\D/g,""))} placeholder="5 digit kode pos"/></div>
        </div>
        <div className="register-privacy">Dengan mengirim permohonan ini, Anda menyatakan bahwa informasi yang diberikan benar dan bersedia data digunakan untuk keperluan administrasi serta verifikasi anggota HIMPANA Cabang Bandung.</div>
        <button className="register-submit" disabled={loading}>{loading?"Mengirim permohonan...":"Kirim Permohonan Data Ulang"} <ArrowRight size={15} style={{verticalAlign:"middle",marginLeft:5}}/></button>
      </>}
    </form>
  </div></main>;
}