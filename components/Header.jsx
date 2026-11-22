"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex min-h-[76px] flex-wrap items-center justify-between gap-3 px-[max(18px,calc((100vw-1160px)/2))] py-3 transition-all duration-300 lg:h-[84px] lg:flex-nowrap lg:py-0 ${
        scrolled
          ? "bg-white border-b border-[#edf1ee] shadow-sm"
          : "bg-transparent border-b border-white/10"
      }`}
    >
      <Link
        href="/"
        className={`flex shrink-0 items-center gap-3 transition-colors ${
          scrolled ? "text-[#173e2c]" : "text-white"
        }`}
      >
        <img
          className="h-11 w-[118px] object-contain object-left sm:w-[132px]"
          src="https://himpana.com/logo-himpana.png"
          alt="Logo HIMPANA"
        />
        <span>
          <strong className="block font-extrabold tracking-wide">
            HIMPANA
          </strong>
          <small
            className={`block text-[11px] transition-colors ${
              scrolled ? "text-[#75857b]" : "text-white/80"
            }`}
          >
            Cabang Bandung
          </small>
        </span>
      </Link>

      <nav className="order-3 flex w-full items-center justify-between gap-5 overflow-x-auto py-2 lg:order-none lg:w-auto lg:justify-center lg:py-0">
        {["Beranda", "Tentang", "Mutasi", "Pengurus", "Kontak"].map((x, i) => (
          <a
            key={x}
            href={["#beranda", "#tentang", "#mutasi", "#pengurus", "#kontak"][i]}
            className={`shrink-0 text-xs font-bold transition ${
              scrolled
                ? "text-[#506358] hover:text-[#2563eb]"
                : "text-white/90 hover:text-white"
            }`}
          >
            {x}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <Link
          className={`rounded-lg px-2 py-2 text-[11px] font-bold sm:px-3 sm:text-xs transition ${
            scrolled
              ? "text-[#2563eb] hover:text-[#1d4ed8]"
              : "text-white hover:text-white/80"
          }`}
          href="/login"
        >
          Login Admin
        </Link>
        <Link
          className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#1d4ed8] sm:px-4 sm:text-xs shadow-md"
          href="/register"
        >
          Data Ulang <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}