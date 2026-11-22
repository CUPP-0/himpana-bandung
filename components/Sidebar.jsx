"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, ClipboardCheck, LogOut, Menu, X } from "lucide-react";

const nav = [
  ["/dashboard/home", "Dashboard", LayoutDashboard],
  ["/dashboard/member", "Member / Anggota", Users],
  ["/dashboard/iuran", "Iuran", Wallet],
  ["/dashboard/data-ulang", "Data Ulang", ClipboardCheck],
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const linkClass = (href) => "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition " +
    (path === href ? "bg-blue-800 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-800");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/home" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-800 text-lg font-black text-white">H</span>
          <span><b className="block text-sm font-extrabold tracking-tight text-slate-900">HIMPANA</b><small className="text-[10px] font-medium text-slate-500">Admin · Cabang Bandung</small></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi admin">
          {nav.map(([href, label, Icon]) => <Link key={href} href={href} className={linkClass(href)}><Icon size={15} />{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-800">Administrator</span>
          <form action="/api/auth/logout" method="post"><button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><LogOut size={14} /> Keluar</button></form>
        </div>
        <button type="button" onClick={() => setOpen(v => !v)} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      <div className="border-t border-slate-100 px-3 py-2 lg:hidden">
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Navigasi admin mobile">
          {nav.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={linkClass(href)}><Icon size={15} />{label}</Link>)}
        </nav>
      </div>
      {open && <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
        <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-600">Administrator HIMPANA Bandung</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">Admin</span></div>
        <form action="/api/auth/logout" method="post"><button className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"><LogOut size={14} /> Keluar dari Admin</button></form>
      </div>}
    </header>
  );
}