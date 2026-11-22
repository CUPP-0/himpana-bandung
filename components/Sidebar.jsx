"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, ClipboardCheck, LogOut } from "lucide-react";

const nav = [
  ["/dashboard/home", "Dashboard", LayoutDashboard],
  ["/dashboard/member", "Member / Anggota", Users],
  ["/dashboard/iuran", "Iuran", Wallet],
  ["/dashboard/data-ulang", "Data Ulang", ClipboardCheck],
];

export default function Sidebar() {
  const path = usePathname();
  const linkClass = (href) => "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition " +
    (path === href ? "bg-blue-800 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-800");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1500px] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/home" className="flex w-[220px] shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-800 text-lg font-black text-white">H</span>
          <span className="min-w-0"><b className="block text-sm font-extrabold tracking-tight text-slate-900">HIMPANA</b><small className="block text-[10px] font-medium text-slate-500">Admin · Cabang Bandung</small></span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2" aria-label="Navigasi admin">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon size={15} strokeWidth={2} />{label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden rounded-full bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-800 sm:inline-flex">Administrator</span>
          <form action="/api/auth/logout" method="post">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
              <LogOut size={14} /><span className="hidden sm:inline">Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}