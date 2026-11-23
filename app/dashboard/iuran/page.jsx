"use client";
import WhatsAppGroups from "@/components/WhatsAppGroups";
import {useEffect,useMemo,useState} from "react";
import {Plus,Upload,CheckCircle2,Search,RefreshCw,Edit3,FileText,Image as ImageIcon,X,Download,Eye} from "lucide-react";

const months=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const dateText=value=>{if(!value)return "-";const d=new Date(String(value).slice(0,10)+"T00:00:00");return Number.isNaN(d.getTime())?String(value):new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"long",year:"numeric"}).format(d)};
const field="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10";
const btn="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50";
const empty=()=>({member_id:"",nominal:"",metode:"Transfer",tanggal_bayar:new Date().toISOString().slice(0,10),notify_group:true,catatan:"",bukti_path:""});

export default function Iuran(){
  const [rows,S]=useState([]),[members,M]=useState([]),[total,T]=useState(0);
  const [year,Y]=useState(new Date().getFullYear()),[month,H]=useState(String(new Date().getMonth()+1));
  const [q,Q]=useState(""),[filter,Z]=useState("all"),[open,O]=useState(false),[msg,G]=useState("");
  const [ocr,C]=useState(false),[busy,B]=useState(false),[form,F]=useState(empty()),[file,SetFile]=useState(null),[editing,E]=useState(null);
  const [preview,P]=useState(null);

  async function load(){
    const [a,b]=await Promise.all([fetch("/api/dues?year="+year),fetch("/api/members")]);
    const x=await a.json(),z=await b.json();
    if(!a.ok){G(x.error||"Gagal memuat pembayaran.");return}
    S(x.data||[]);T(x.total||0);M(z.data||[]);
  }
  useEffect(()=>{load()},[year]);

  function startCreate(){E(null);F(empty());SetFile(null);G("");O(true)}
  function startEdit(p){E(p);F({member_id:String(p.member_id),nominal:String(p.nominal),metode:p.metode||"Tunai",tanggal_bayar:String(p.tanggal_bayar).slice(0,10),notify_group:false,catatan:p.catatan||"",bukti_path:p.bukti_path||""});SetFile(null);G("");O(true)}

  async function uploadSelected(){
    if(!file)return form.bukti_path||"";
    const fd=new FormData();fd.append("file",file);
    const r=await fetch("/api/dues/proof-upload",{method:"POST",body:fd});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||"Upload bukti gagal.");
    return d.bukti_path;
  }

  async function scan(selected){
    if(!selected)return;
    if(!selected.type.startsWith("image/")){G("OCR hanya mendukung file gambar. PDF tetap bisa diunggah sebagai bukti.");return}
    C(true);G("");
    try{
      const fd=new FormData();fd.append("file",selected);
      const r=await fetch("/api/dues/ocr",{method:"POST",body:fd}),d=await r.json();
      if(!r.ok)throw new Error(d.error||"OCR gagal.");
      const x=d.result||{};
      F(v=>({...v,nominal:x.nominal||v.nominal,tanggal_bayar:x.tanggal||v.tanggal_bayar,catatan:[x.nama_pengirim&&"Pengirim: "+x.nama_pengirim,x.nama_bank&&"Bank: "+x.nama_bank,x.nomor_rekening&&"Rekening: "+x.nomor_rekening,x.catatan].filter(Boolean).join(" | ")}));
      G("Data OCR berhasil dibaca. Periksa kembali sebelum menyimpan.");
    }catch(e){G(e.message)}finally{C(false)}
  }

  async function save(e){
    e.preventDefault();B(true);G("");
    try{
      const proof=await uploadSelected();
      const tanggal=form.tanggal_bayar;
      const payload={...form,bukti_path:proof,bulan:String(Number(tanggal.slice(5,7))),tahun:String(Number(tanggal.slice(0,4)))};
      const url=editing?"/api/dues/"+editing.id:"/api/dues";
      const r=await fetch(url,{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Pembayaran gagal disimpan.");
      if(editing){G("Pembayaran berhasil diperbarui.");}
      else{G(d.whatsapp?.sent?"Pembayaran tersimpan dan notifikasi WhatsApp terkirim.":"Pembayaran berhasil dicatat.");}
      O(false);SetFile(null);await load();P({title:"Kuitansi Pembayaran",url:"/api/dues/"+(editing?editing.id:d.id)+"/receipt",download:true});
    }catch(e){G(e.message)}finally{B(false)}
  }

  const paid=useMemo(()=>rows.filter(x=>Number(x.bulan)===Number(month)),[rows,month]);
  const paidIds=new Set(paid.map(x=>Number(x.member_id)));
  const unpaid=members.filter(x=>!paidIds.has(Number(x.id)));
  const shown=paid.filter(x=>([x.nama,x.nomor_pensiun,x.nomor_anggota].join(" ").toLowerCase().includes(q.toLowerCase()))&&(filter==="all"||(filter==="transfer"&&x.metode==="Transfer")||(filter==="cash"&&x.metode==="Tunai")));
  const monthTotal=paid.reduce((n,x)=>n+Number(x.nominal),0);
  const stats=[["Total pemasukan "+year,money(total)],["Pemasukan "+months[Number(month)-1],money(monthTotal)],["Sudah membayar",paid.length],["Belum membayar",unpaid.length]];

  return <>
    <WhatsAppGroups/>
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div><span className="text-[10px] font-extrabold tracking-[1.8px] text-blue-800">KEUANGAN ANGGOTA</span><h1 className="mt-1 text-2xl font-extrabold text-slate-900">Iuran Anggota</h1><p className="mt-1 text-xs text-slate-500">Catat dan kelola pembayaran iuran, bukti transfer, serta kuitansi anggota.</p></div>
      <button className={btn+" bg-blue-800 text-white hover:bg-blue-900"} onClick={startCreate}><Plus size={15}/> Catat Pembayaran</button>
    </div>
    {msg&&!open&&<div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">{msg}</div>}
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(([l,v])=><div key={l} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><label className="text-[11px] text-slate-500">{l}</label><strong className="mt-2 block break-words text-xl font-extrabold text-slate-900">{v}</strong></div>)}</div>

    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-3 text-slate-400"/><input className={field+" w-full pl-9"} placeholder="Cari nama, nomor pensiun, atau KTA..." value={q} onChange={e=>Q(e.target.value)}/></div>
          <select className={field} value={month} onChange={e=>H(e.target.value)}>{months.map((m,i)=><option value={i+1} key={m}>{m}</option>)}</select>
          <select className={field} value={year} onChange={e=>Y(Number(e.target.value))}>{[year-1,year,year+1].map(y=><option key={y}>{y}</option>)}</select>
          <select className={field} value={filter} onChange={e=>Z(e.target.value)}><option value="all">Semua metode</option><option value="transfer">Transfer</option><option value="cash">Tunai / Cash</option></select>
          <button className={btn+" border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"} onClick={load}><RefreshCw size={14}/> Refresh</button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500">Menampilkan {shown.length} transaksi pada {months[Number(month)-1]} {year}.</p><p className="text-xs font-bold text-slate-700">Total: {money(monthTotal)}</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{["Anggota","No. Pensiun","Tanggal Bayar","Periode","Nominal","Metode","Bukti Bank","Kuitansi","Aksi"].map(x=><th key={x} className="px-4 py-3 font-bold">{x}</th>)}</tr></thead>
          <tbody>{shown.map(p=><tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="px-4 py-3"><b className="block text-slate-800">{p.nama}</b><span className="mt-1 block text-[10px] text-slate-500">KTA: {p.nomor_anggota||"-"}</span></td>
            <td className="px-4 py-3 font-medium text-slate-700">{p.nomor_pensiun||"-"}</td>
            <td className="px-4 py-3 whitespace-nowrap text-slate-700">{dateText(p.tanggal_bayar)}</td>
            <td className="px-4 py-3 whitespace-nowrap">{months[Number(p.bulan)-1]} {p.tahun}</td>
            <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">{money(p.nominal)}</td>
            <td className="px-4 py-3"><span className={"rounded-full px-2.5 py-1 text-[10px] font-bold "+(p.metode==="Transfer"?"bg-blue-50 text-blue-800":"bg-emerald-50 text-emerald-700")}>{p.metode==="Transfer"?"Transfer":"Tunai"}</span></td>
            <td className="px-4 py-3">{p.bukti_path?<button onClick={()=>P({title:"Bukti Transfer Bank",url:"/api/dues/proof/"+p.id,download:false})} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 px-2.5 py-2 font-bold text-blue-800 hover:bg-blue-50"><Eye size={13}/> Preview</button>:<span className="text-[10px] text-slate-400">{p.metode==="Tunai"?"Tidak diperlukan":"Belum ada"}</span>}</td>
            <td className="px-4 py-3"><button onClick={()=>P({title:"Kuitansi Pembayaran",url:"/api/dues/"+p.id+"/receipt",download:true})} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 font-bold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"><FileText size={13}/> Kuitansi</button></td>
            <td className="px-4 py-3"><button onClick={()=>startEdit(p)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-2 font-bold text-white hover:bg-blue-900"><Edit3 size={13}/> Edit</button></td>
          </tr>)}
          {!shown.length&&<tr><td colSpan="9" className="p-10 text-center text-xs text-slate-500">Belum ada transaksi untuk filter ini.</td></tr>}</tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-4 py-3 text-[10px] leading-5 text-slate-500">Bukti transfer bersifat opsional untuk pembayaran tunai. Kuitansi dibuat otomatis dari data transaksi dan dapat diunduh sebagai PDF.</p>
    </section>

    {open&&<div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/60 p-3 sm:p-5">
      <form onSubmit={save} className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6"><div><h2 className="text-base font-extrabold text-slate-900">{editing?"Edit Pembayaran":"Catat Pembayaran Iuran"}</h2><p className="mt-1 text-[10px] text-slate-500">Pastikan tanggal dan nominal sesuai bukti pembayaran.</p></div><button type="button" onClick={()=>O(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><X size={17}/></button></div>
        <div className="space-y-4 p-5 sm:p-6">
          {msg&&<div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">{msg}</div>}
          <label className="block text-[11px] font-bold text-slate-700">Anggota<select className={field+" mt-1.5 w-full"} required disabled={!!editing} value={form.member_id} onChange={e=>F({...form,member_id:e.target.value})}><option value="">Pilih anggota</option>{members.map(m=><option value={m.id} key={m.id}>{m.nama} · Pensiun: {m.nomor_pensiun||"-"} · KTA: {m.nomor_anggota||"-"}</option>)}</select></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] font-bold text-slate-700">Tanggal bayar<input className={field+" mt-1.5 w-full"} type="date" required value={form.tanggal_bayar} onChange={e=>F({...form,tanggal_bayar:e.target.value})}/></label>
            <label className="text-[11px] font-bold text-slate-700">Nominal (Rp)<input className={field+" mt-1.5 w-full"} type="number" min="1" required value={form.nominal} onChange={e=>F({...form,nominal:e.target.value})} placeholder="Contoh: 100000"/></label>
            <label className="text-[11px] font-bold text-slate-700 sm:col-span-2">Metode pembayaran<select className={field+" mt-1.5 w-full"} value={form.metode} onChange={e=>F({...form,metode:e.target.value})}><option value="Transfer">Transfer Bank</option><option value="Tunai">Tunai / Cash</option></select></label>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 p-4">
            <div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-800"><Upload size={17}/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-800">Resi / Bukti Transfer Bank</p><p className="mt-1 text-[10px] leading-5 text-slate-500">Opsional. Bisa unggah gambar atau PDF hingga 8 MB. Untuk tunai, bagian ini boleh dikosongkan.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50"><Upload size={13}/> {file?file.name:form.bukti_path?"Ganti bukti transfer":"Pilih file bukti"}<input hidden type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>{const f=e.target.files?.[0];SetFile(f||null);if(f&&f.type.startsWith("image/"))scan(f)}}/></label>{form.bukti_path&&!file&&<p className="mt-2 text-[10px] font-semibold text-emerald-700">Bukti sebelumnya tersimpan.</p>}{ocr&&<p className="mt-2 text-[10px] text-blue-700">Membaca bukti dengan AI...</p>}</div></div>
          </div>
          <label className="block text-[11px] font-bold text-slate-700">Catatan<input className={field+" mt-1.5 w-full"} value={form.catatan} onChange={e=>F({...form,catatan:e.target.value})} placeholder="Catatan tambahan (opsional)"/></label>
          {!editing&&<label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={form.notify_group} onChange={e=>F({...form,notify_group:e.target.checked})}/> Kirim ucapan pembayaran ke grup WhatsApp</label>}
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:px-6"><button type="button" className={btn+" border border-slate-200 text-slate-600 hover:bg-slate-50"} onClick={()=>O(false)}>Batal</button><button className={btn+" bg-blue-800 text-white hover:bg-blue-900"} disabled={busy||ocr}><CheckCircle2 size={14}/>{busy?"Menyimpan...":editing?"Simpan Perubahan":"Simpan Pembayaran"}</button></div>
      </form>
    </div>}

    {preview&&<div className="fixed inset-0 z-[90] flex flex-col bg-slate-950/70 p-3 sm:p-6"><div className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-t-xl bg-white px-4 py-3"><div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">{preview.download?<FileText size={17}/>:<ImageIcon size={17}/>} {preview.title}</div><div className="flex items-center gap-2">{preview.download&&<a href={preview.url} download className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-3 py-2 text-xs font-bold text-white hover:bg-blue-900"><Download size={14}/> Download PDF</a>}<button onClick={()=>P(null)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><X size={17}/></button></div></div><div className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-b-xl bg-slate-100">{preview.url.endsWith(".pdf")||preview.download?<iframe title={preview.title} src={preview.url} className="h-full w-full border-0"/>:<iframe title={preview.title} src={preview.url} className="h-full w-full border-0 bg-white"/>}</div></div>}
  </>;
}