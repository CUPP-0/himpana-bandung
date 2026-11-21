"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ShieldCheck,ArrowLeft} from "lucide-react";
export default function Login(){
 const [username,U]=useState(""),[password,P]=useState(""),[error,E]=useState(""),[busy,B]=useState(false);const router=useRouter();
 async function submit(e){e.preventDefault();B(true);E("");try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});const d=await r.json();if(!r.ok)throw Error(d.error);router.replace("/dashboard/home");router.refresh()}catch(e){E(e.message||"Login gagal")}finally{B(false)}}
 return <main className="grid min-h-screen place-items-center bg-[#edf6f0] px-4 py-10"><form onSubmit={submit} className="w-full max-w-[410px] rounded-2xl border border-[#e5ece6] bg-white p-7 shadow-xl shadow-[#1c5830]/10 sm:p-9">
 <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-[#34754e]"><ArrowLeft size={15}/> Kembali ke beranda</Link>
 <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#176f49] text-xl font-extrabold text-white">H</span><span><b className="block text-sm font-extrabold text-[#173e2c]">HIMPANA</b><small className="text-[11px] text-[#75857b]">Cabang Bandung</small></span></div>
 <div className="mt-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#176f49]"><ShieldCheck size={22}/></div><h1 className="mb-2 mt-5 text-2xl font-extrabold text-[#183d2a]">Selamat datang</h1><p className="mb-6 text-xs leading-6 text-[#77857b]">Masuk ke panel administrasi HIMPANA Bandung.</p>
 {error&&<div className="mb-4 rounded-lg bg-[#fff0ed] px-4 py-3 text-xs text-[#b04438]">{error}</div>}
 <label className="mb-2 block text-xs font-bold text-[#53665a]">Username</label><input className="mb-4 h-11 w-full rounded-lg border border-[#dfe8e1] px-3 text-sm outline-none focus:border-[#6ca783] focus:ring-4 focus:ring-[#176f49]/10" required value={username} onChange={e=>U(e.target.value)} autoComplete="username"/>
 <label className="mb-2 block text-xs font-bold text-[#53665a]">Password</label><input className="h-11 w-full rounded-lg border border-[#dfe8e1] px-3 text-sm outline-none focus:border-[#6ca783] focus:ring-4 focus:ring-[#176f49]/10" required type="password" value={password} onChange={e=>P(e.target.value)} autoComplete="current-password"/>
 <button className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-[#176f49] text-xs font-extrabold text-white transition hover:bg-[#105a3b] disabled:opacity-60" disabled={busy}>{busy?"Memproses...":"Masuk ke Sistem"}</button>
 </form></main>
}