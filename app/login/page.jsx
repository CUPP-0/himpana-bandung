"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

const inputClass = "min-h-[46px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10";
const labelClass = "mb-2 block text-xs font-bold text-slate-700";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Login gagal. Periksa username dan password Anda.");
      router.replace("/dashboard/home");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba kembali.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[41%_59%]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#102d55] text-white lg:block">
        <div className="absolute inset-0 bg-[url('/images/hero-pertamina.png')] bg-cover bg-center opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08284c]/60 via-[#0b3768]/65 to-[#061c38]/95" />
        <div className="relative z-10 flex min-h-screen flex-col px-10 py-12 xl:px-16">
          <div className="mb-14">
            <span className="text-xs font-bold tracking-[.28em] text-blue-100">HIMPANA CABANG BANDUNG</span>
            <h1 className="mt-5 text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">PANEL<br />ADMINISTRASI</h1>
            <div className="mt-5 h-1 w-28 bg-white" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">Kelola data anggota dan layanan administrasi HIMPANA Cabang Bandung dalam satu sistem.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 text-slate-900 shadow-xl">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-800"><ShieldCheck size={22} /></span>
              <span><b className="block text-sm">Akses Khusus Admin</b><small className="mt-1 block text-xs leading-relaxed text-slate-600">Halaman ini hanya untuk pengelola HIMPANA.</small></span>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 text-slate-900 shadow-xl">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-800"><LockKeyhole size={21} /></span>
              <span><b className="block text-sm">Akses Aman dan Terjaga</b><small className="mt-1 block text-xs leading-relaxed text-slate-600">Gunakan akun admin yang telah terdaftar.</small></span>
            </div>
          </div>

          <div className="mt-auto pt-12">
            <div className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 font-extrabold text-slate-900 shadow-xl"><ShieldCheck size={20} className="text-blue-800" /> Login Administrator</div>
            <p className="mt-7 text-xs leading-6 text-blue-100">HIMPANA · CABANG BANDUNG<br />Peduli dan Melayani</p>
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="w-full max-w-[460px]">
          <div className="mb-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-[#102d55]">
              <img className="h-10 w-24 object-contain object-left" src="https://himpana.com/logo-himpana.png" alt="Logo HIMPANA" />
              <span><b className="block text-sm font-extrabold">HIMPANA</b><small className="text-[10px] text-slate-500">Cabang Bandung</small></span>
            </Link>
            <Link href="/" className="text-xs font-semibold text-blue-800 transition hover:text-blue-950"><ArrowLeft className="mr-1 inline" size={14} /> Kembali</Link>
          </div>

          <div className="mb-8">
            <span className="text-[10px] font-extrabold tracking-[1.8px] text-blue-800">AREA ADMINISTRATOR</span>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><ShieldCheck size={24} /></div>
            <h2 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">Selamat Datang</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">Masuk untuk melanjutkan ke panel administrasi HIMPANA Cabang Bandung.</p>
          </div>

          {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">{error}</div>}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="username" className={labelClass}>Username</label>
              <div className="relative">
                <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="username" className={inputClass + " pl-10"} required autoFocus autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username admin" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="password" className={inputClass + " pl-10"} required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" />
              </div>
            </div>
            <button type="submit" disabled={busy} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60">
              {busy ? "Memproses..." : "Masuk ke Sistem"} {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center text-[10px] leading-5 text-slate-400">Halaman khusus administrator HIMPANA Cabang Bandung.<br />Pastikan Anda menggunakan perangkat yang aman.</div>
        </div>
      </section>
    </main>
  );
}
