import pool from "@/lib/db";
import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header"; // <-- Import Header di sini

export const dynamic = "force-dynamic";

async function getPublicData() {
  let stats = { total: 0, dataUlang: 0 };
  let deaths = [];
  try {
    const [[row]] = await pool.query(`
      SELECT COUNT(*) AS total,
      COALESCE(SUM(status_data_ulang NOT IN ('BLMDU','BWDU')),0) AS data_ulang
      FROM members
    `);
    stats = {
      total: Number(row.total || 0),
      dataUlang: Number(row.data_ulang || 0),
    };
  } catch {}
  try {
    const [rows] = await pool.query(
      "SELECT id,nama,nomor_pensiun,tanggal_meninggal,keterangan FROM member_deaths ORDER BY tanggal_meninggal DESC LIMIT 100",
    );
    deaths = rows;
  } catch {}
  return { stats, deaths };
}

const container = "mx-auto w-[min(1160px,calc(100%-36px))]";

export default async function PublicHome() {
  const { stats, deaths } = await getPublicData();

  return (
    <main className="overflow-hidden bg-white font-sans text-[#18372a]">
      {/* Gunakan komponen Header yang sudah dipisah */}
      <Header />

      <section
        id="beranda"
        className="relative isolate min-h-screen text-white"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/hero-pertamina.png)" }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

        {/* Pattern Overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-[.08]" />

        <div
          className={
            container + " flex min-h-screen items-center py-14 lg:py-12"
          }
        >
          <div className="max-w-[720px]">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[1.7px] text-white">
              <i className="h-2 w-2 rounded-full bg-white ring-4 ring-white/20" />
              PERHIMPUNAN PENSIUNAN PERTAMINA
            </span>

            <h1 className="my-6 text-[clamp(36px,5vw,58px)] font-extrabold leading-[1.13] tracking-[-2px] drop-shadow-lg">
              Peduli dan Melayani,
              <br />
              <em className="not-italic text-white">
                Para Veteran Pejuang Energi.
              </em>
            </h1>

            <p className="max-w-[560px] text-sm leading-8 text-white/90 drop-shadow">
              HIMPANA Cabang Bandung hadir sebagai wadah silaturahmi,
              komunikasi, dan pelayanan bagi keluarga besar pensiunan Pertamina.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3.5 text-xs font-bold text-black shadow-lg hover:bg-white/90 transition"
              >
                Ajukan Data Ulang <ArrowUpRight size={17} />
              </Link>
              <Link
                href="/tracking"
                className="inline-flex items-center gap-2 rounded-lg border border-white px-5 py-3.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Lacak Data Ulang <ChevronRight size={17} />
              </Link>
              <a
                href="#tentang"
                className="inline-flex items-center gap-2 text-xs font-bold text-white border border-white/70 px-5 py-3.5 rounded-lg hover:bg-white/10 transition"
              >
                Kenali HIMPANA <ChevronRight size={17} />
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3 text-[10px] leading-relaxed text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white bg-white/5 backdrop-blur-sm">
                <Users size={17} />
              </span>
              <span className="drop-shadow">
                Terhubung dalam satu keluarga besar
                <br />
                <b className="text-white">HIMPANA Cabang Bandung</b>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 backdrop-blur-md bg-black/20">
          <div
            className={
              container +
              " flex h-12 items-center justify-between text-[9px] font-bold tracking-[1.4px] text-white"
            }
          >
            <span>Peduli dan Melayani</span>
            <span>HIMPANA · CABANG BANDUNG</span>
          </div>
        </div>
      </section>

      <section id="tentang" className="bg-[#f8fafc] py-14 sm:py-20">
        <div
          className={
            container +
            " grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]"
          }
        >
          {/* Kolom Teks */}
          <div className="mb-2 md:col-span-2 lg:col-span-1 lg:my-auto">
            <span className="text-[10px] font-extrabold tracking-[1.7px] text-[#2563eb]">
              DATA ANGGOTA
            </span>
            <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-tight text-[#0f172a]">
              Terus terhubung,
              <br />
              <span className="text-[#2563eb]">terus diperbarui.</span>
            </h2>
            <p className="max-w-[340px] text-sm leading-7 text-[#475569]">
              Pembaruan data membantu memastikan informasi anggota tetap akurat
              dan pelayanan berjalan lebih baik.
            </p>
          </div>

          {/* Kolom Kartu Statistik */}
          {[
            {
              value: stats.total,
              label: "Total Anggota",
              desc: "Terdaftar dalam database cabang",
              Icon: Users,
            },
            {
              value: stats.dataUlang,
              label: "Sudah Data Ulang",
              desc: "Anggota dengan status data ulang selesai",
              Icon: ClipboardCheck,
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className={
                "flex min-h-[170px] flex-col items-start justify-center rounded-xl border p-6 transition-all duration-300 hover:shadow-xl " +
                (i
                  ? "border-[#2563eb] bg-[#2563eb] text-white shadow-blue-200/50"
                  : "border-blue-100 bg-white text-[#0f172a]")
              }
            >
              <span
                className={
                  "grid h-11 w-11 place-items-center rounded-xl " +
                  (i ? "bg-white/20 text-white" : "bg-blue-50 text-[#2563eb]")
                }
              >
                <s.Icon size={21} />
              </span>
              <strong className="my-3 text-4xl font-extrabold">
                {s.value.toLocaleString("id-ID")}
              </strong>
              <b className="text-sm">{s.label}</b>
              <small
                className={
                  "mt-1.5 text-[11px] " +
                  (i ? "text-blue-100" : "text-[#64748b]")
                }
              >
                {s.desc}
              </small>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#1e40af] py-14 text-white sm:py-20">
        <div
          className={
            container +
            " grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-[75px]"
          }
        >
          {/* Kolom Kiri: Foto Ketua */}
          <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:mx-0">
            {/* Efek glow biru di belakang foto */}
            <div className="absolute -inset-4 rounded-2xl bg-blue-400/20 blur-2xl" />

            {/* Ganti src="/images/ketua.jpg" dengan path foto ketua yang asli */}
            <img
              src="/images/ketua.jpeg"
              alt="Ketua HIMPANA Cabang Bandung"
              className="relative z-10 w-full rounded-2xl border-4 border-white/10 object-cover shadow-2xl aspect-[4/5] bg-blue-950/50"
            />
          </div>

          {/* Kolom Kanan: Teks Sambutan */}
          <div>
            <span className="text-[10px] font-extrabold tracking-[1.7px] text-blue-200">
              SAMBUTAN KETUA
            </span>
            <h2 className="my-4 text-3xl font-extrabold leading-tight sm:text-[32px]">
              Menjaga kebersamaan,
              <br />
              <em className="not-italic text-blue-300">
                menghargai pengabdian.
              </em>
            </h2>
            <p className="text-sm leading-7 text-blue-100">
              Selamat datang di website HIMPANA Cabang Bandung. Website ini
              menjadi sarana informasi dan komunikasi bagi anggota, sekaligus
              mendukung pembaruan data agar pelayanan organisasi semakin
              tertata.
            </p>
            <p className="mt-3 text-sm leading-7 text-blue-100">
              Semoga semangat kekeluargaan dan silaturahmi senantiasa terjaga di
              antara seluruh keluarga besar pensiunan Pertamina.
            </p>
            <div className="mt-7 border-t border-white/20 pt-4">
              <strong className="block text-sm font-bold">
                Ketua HIMPANA Cabang Bandung
              </strong>
              <small className="mt-1 block text-xs text-blue-200">
                Perhimpunan Pensiunan Pertamina
              </small>
            </div>
          </div>
        </div>
      </section>

      <section id="lokasi" className="bg-[#f8fafc] py-14 sm:py-20">
        <div
          className={
            container +
            " grid items-center gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14"
          }
        >
          {/* Kolom Kiri: Informasi Teks */}
          <div>
            <span className="text-[10px] font-extrabold tracking-[1.7px] text-blue-600">
              KUNJUNGI KAMI
            </span>
            <h2 className="my-3 text-3xl font-extrabold leading-tight text-slate-900">
              Lokasi HIMPANA
              <br />
              <span className="text-blue-600">Cabang Bandung</span>
            </h2>
            <p className="max-w-[340px] text-sm leading-7 text-slate-500">
              Silakan kunjungi kantor kami untuk mendapatkan informasi lebih
              lanjut atau keperluan administrasi dan silaturahmi anggota.
            </p>

            {/* Kartu Alamat */}
            <div className="mt-7 flex items-start gap-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin size={20} />
              </div>
              <span>
                <b className="block text-sm font-bold text-slate-900">
                  Kantor HIMPANA Cabang Bandung
                </b>
                <small className="mt-1 block text-xs leading-relaxed text-slate-600">
                  Jl. Ganesha No.10, Lb. Siliwangi, Kecamatan Coblong,
                  <br />
                  Kota Bandung, Jawa Barat 40132
                </small>
              </span>
            </div>

            {/* Tombol Buka Maps */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Jl.+Ganesha+No.10,+Bandung"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              Buka di Google Maps <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Kolom Kanan: Visual Peta */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg sm:min-h-[320px]">
            {/* Background pattern ala peta */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(#2563eb 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            ></div>

            {/* Konten Placeholder Peta (Ganti dengan iframe Google Maps asli jika sudah ada) */}
            <div className="relative z-10 flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center sm:min-h-[320px]">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
                <MapPin size={32} />
              </div>
              <b className="text-sm font-bold text-slate-800">
                Peta Lokasi Kantor
              </b>
              <span className="max-w-[250px] text-xs leading-relaxed text-slate-500">
                Jl. Ganesha No.10, Lb. Siliwangi, Kec. Coblong, Kota Bandung
              </span>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d874512.5839675819!2d106.95242482740841!3d-7.353357719942386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e65767c9b183%3A0x2478e3dcdce37961!2sInstitut%20Teknologi%20Bandung!5e0!3m2!1sid!2sid!4v1795323443351!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, position: "absolute", inset: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="z-20"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="pengurus" className="bg-white py-14 sm:py-20">
        <div className={container}>
          {/* Header Section */}
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <span className="text-[10px] font-extrabold tracking-[1.7px] text-blue-600">
                ORGANISASI
              </span>
              <h2 className="mb-2 mt-3 text-3xl font-extrabold text-[#1e3a5f]">
                Pengurus Cabang
              </h2>
              <p className="max-w-[420px] text-sm leading-7 text-[#6b7280]">
                Berkenalan dengan pengurus HIMPANA Cabang Bandung yang
                berdedikasi melayani keluarga besar pensiunan Pertamina.
              </p>
            </div>
            <span className="hidden text-[9px] font-extrabold tracking-widest text-[#9ca3af] sm:block">
              02 / ORGANISASI
            </span>
          </div>

          {/* Grid Card Pengurus */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
            {[
              {
                name: "H. Ahmad Suryadi",
                role: "Ketua Cabang",
                photo:
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=650&fit=crop&crop=faces",
              },
              {
                name: "Drs. Bambang Wijaya",
                role: "Wakil Ketua",
                photo:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=650&fit=crop&crop=faces",
              },
              {
                name: "Siti Nurhaliza, S.E.",
                role: "Sekretaris",
                photo:
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=650&fit=crop&crop=faces",
              },
              {
                name: "Rina Kartika, S.Ak.",
                role: "Bendahara",
                photo:
                  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=650&fit=crop&crop=faces",
              },
            ].map((p, i) => (
              <div key={i} className="group">
                {/* Foto saja, rounded besar, tanpa border/shadow */}
                <div className="overflow-hidden rounded-2xl bg-[#a8c0d6]">
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Nama & jabatan langsung di bawah foto, tanpa wrapper */}
                <h3 className="mt-4 text-[17px] font-bold leading-snug text-[#1e3a5f]">
                  {p.name}
                </h3>
                <p className="mt-1 text-[13px] text-[#6b7280]">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION KONTAK ================= */}
      <section
        id="kontak"
        className="relative isolate overflow-hidden py-16 sm:py-24"
      >
        {/* Background Foto */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/kontak.png)" }}
        />

        {/* Overlay Gradient Hitam */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 via-black/35 to-black/30" />

        {/* Pattern Overlay (opsional, biar konsisten dengan hero) */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-[.06]" />

        <div
          className={
            container +
            " relative flex flex-col justify-between gap-10 lg:flex-row lg:items-start"
          }
        >
          {/* Kolom Kiri: Judul & Deskripsi */}
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[1.7px] text-blue-300">
              <i className="h-2 w-2 rounded-full bg-blue-300 ring-4 ring-white/10" />
              HUBUNGI KAMI
            </span>
            <h2 className="my-3 text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
              Ada pertanyaan atau
              <br />
              <span className="text-blue-300">butuh bantuan?</span>
            </h2>
            <p className="text-sm leading-7 text-white/80 drop-shadow">
              Silakan hubungi pengurus HIMPANA Cabang Bandung melalui kontak
              resmi di bawah ini. Kami siap membantu Anda.
            </p>
          </div>

          {/* Kolom Kanan: Kartu Kontak */}
          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            {/* Kartu Telepon/WA */}
            <div className="flex min-w-0 flex-1 items-start gap-4 rounded-xl border border-white/10 bg-white p-5 shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Phone size={20} />
              </div>
              <span>
                <small className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Call Center / WhatsApp
                </small>
                <b className="mt-1 block text-sm font-bold text-slate-900">
                  +62 812-3456-7890
                </b>
                <small className="mt-1 block text-xs text-slate-500">
                  (Contoh, akan diperbarui)
                </small>
              </span>
            </div>

            {/* Kartu Email */}
            <div className="flex min-w-0 flex-1 items-start gap-4 rounded-xl border border-white/10 bg-white p-5 shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Mail size={20} />
              </div>
              <span>
                <small className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Email Resmi
                </small>
                <b className="mt-1 block text-sm font-bold text-slate-900">
                  bandung@himpana.com
                </b>
                <small className="mt-1 block text-xs text-slate-500">
                  (Contoh, akan diperbarui)
                </small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white">
        <div
          className={
            container +
            " flex flex-col items-start justify-between gap-8 py-12 lg:flex-row lg:items-center"
          }
        >
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-4 lg:max-w-sm">
            <Link href="/" className="flex items-center gap-3">
              <img
                className="h-10 w-[110px] object-contain object-left brightness-0 invert"
                src="https://himpana.com/logo-himpana.png"
                alt="Logo HIMPANA"
              />
              <span>
                <strong className="block text-lg font-extrabold tracking-wide">
                  HIMPANA
                </strong>
                <small className="block text-[11px] text-slate-400">
                  Cabang Bandung
                </small>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Peduli dan Melayani.
              <br />
              Menjaga silaturahmi keluarga besar pensiunan Pertamina.
            </p>
          </div>

          {/* Navigasi Footer */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold text-slate-300">
            <a
              href="#beranda"
              className="transition hover:text-white hover:underline underline-offset-4"
            >
              Beranda
            </a>
            <a
              href="#tentang"
              className="transition hover:text-white hover:underline underline-offset-4"
            >
              Tentang
            </a>
            <a
              href="#mutasi"
              className="transition hover:text-white hover:underline underline-offset-4"
            >
              Mutasi
            </a>
            <a
              href="#pengurus"
              className="transition hover:text-white hover:underline underline-offset-4"
            >
              Pengurus
            </a>
            <a
              href="#kontak"
              className="transition hover:text-white hover:underline underline-offset-4"
            >
              Kontak
            </a>
            <Link
              href="/login"
              className="text-blue-400 transition hover:text-blue-300 hover:underline underline-offset-4"
            >
              Login Admin
            </Link>
          </div>
        </div>

        {/* Copyright Bar */}
        <div
          className={
            container +
            " flex flex-col gap-3 border-t border-slate-800 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:items-center"
          }
        >
          <span>
            © {new Date().getFullYear()} HIMPANA Cabang Bandung. All rights
            reserved.
          </span>
          <span>Perhimpunan Pensiunan Pertamina</span>
        </div>
      </footer>
    </main>
  );
}
