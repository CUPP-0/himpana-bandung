import pool from "@/lib/db";
import Link from "next/link";
import { Users, ClipboardCheck, ArrowUpRight, MapPin, Phone, Mail, ChevronRight } from "lucide-react";

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
    stats = { total: Number(row.total || 0), dataUlang: Number(row.data_ulang || 0) };
  } catch {}
  try {
    const [rows] = await pool.query("SELECT id,nama,nomor_pensiun,tanggal_meninggal,keterangan FROM member_deaths ORDER BY tanggal_meninggal DESC LIMIT 100");
    deaths = rows;
  } catch {}
  return { stats, deaths };
}

const container = "mx-auto w-[min(1160px,calc(100%-36px))]";

export default async function PublicHome() {
  const { stats, deaths } = await getPublicData();
  return (
    <main className="overflow-hidden bg-white font-sans text-[#18372a]">
      <header className="relative z-10 flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-[#edf1ee] bg-white px-[max(18px,calc((100vw-1160px)/2))] py-3 lg:h-[84px] lg:flex-nowrap lg:py-0">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-[#173e2c]">
          <img className="h-11 w-[118px] object-contain object-left sm:w-[132px]" src="https://himpana.com/logo-himpana.png" alt="Logo HIMPANA"/>
          <span><strong className="block font-extrabold tracking-wide">HIMPANA</strong><small className="block text-[11px] text-[#75857b]">Cabang Bandung</small></span>
        </Link>
        <nav className="order-3 flex w-full items-center justify-between gap-5 overflow-x-auto py-2 lg:order-none lg:w-auto lg:justify-center lg:py-0">
          {["Beranda","Tentang","Mutasi","Pengurus","Kontak"].map((x,i)=><a key={x} href={["#beranda","#tentang","#mutasi","#pengurus","#kontak"][i]} className="shrink-0 text-xs font-bold text-[#506358] transition hover:text-[#147348]">{x}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <Link className="rounded-lg px-2 py-2 text-[11px] font-bold text-[#246342] sm:px-3 sm:text-xs" href="/login">Login Admin</Link>
          <Link className="flex items-center gap-1.5 rounded-lg bg-[#176f49] px-3 py-2.5 text-[11px] font-bold text-white sm:px-4 sm:text-xs" href="/register">Data Ulang <ArrowUpRight size={15}/></Link>
        </div>
      </header>

      <section id="beranda" className="relative isolate bg-gradient-to-br from-[#0d4f35] via-[#176f49] to-[#21865a] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.12]" style={{backgroundImage:"radial-gradient(#fff 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
        <div className={container+" grid min-h-[520px] items-center gap-8 py-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-9 lg:py-12"}>
          <div className="max-w-[610px]">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[1.7px] text-[#d6eadc]"><i className="h-2 w-2 rounded-full bg-[#b8e1a9] ring-4 ring-white/10"/> PERHIMPUNAN PENSIUNAN PERTAMINA</span>
            <h1 className="my-6 text-[clamp(36px,5vw,58px)] font-extrabold leading-[1.13] tracking-[-2px]">Merawat Silaturahmi,<br/><em className="not-italic text-[#bce3a9]">Menguatkan Kebersamaan.</em></h1>
            <p className="max-w-[510px] text-sm leading-8 text-[#d9e9df]">HIMPANA Cabang Bandung hadir sebagai wadah silaturahmi, komunikasi, dan pelayanan bagi keluarga besar pensiunan Pertamina.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3.5 text-xs font-bold text-[#176f49]">Ajukan Data Ulang <ArrowUpRight size={17}/></Link>
              <a href="#tentang" className="inline-flex items-center gap-2 text-xs font-bold text-[#eff8f1]">Kenali HIMPANA <ChevronRight size={17}/></a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-[10px] leading-relaxed text-[#d4e7da]"><span className="grid h-10 w-10 place-items-center rounded-full border border-white/30"><Users size={17}/></span><span>Terhubung dalam satu keluarga besar<br/><b className="text-white">HIMPANA Cabang Bandung</b></span></div>
          </div>
          <div className="relative mx-auto grid h-[300px] w-full max-w-[440px] place-items-center sm:h-[360px] lg:h-[390px]">
            <div className="absolute h-[72%] w-[90%] rotate-[-22deg] rounded-[50%] border border-white/20"/>
            <div className="absolute h-[95%] w-[68%] rotate-[38deg] rounded-[50%] border border-white/20"/>
            <div className="flex h-[190px] w-[190px] rotate-[-7deg] flex-col items-center justify-center rounded-full border-[9px] border-white/25 bg-gradient-to-br from-white to-[#e7f2e9] text-[#176f49] shadow-2xl sm:h-[235px] sm:w-[235px]">
              <span className="text-8xl font-extrabold leading-none sm:text-[104px]">H</span><small className="font-extrabold tracking-[3px]">HIMPANA</small><i className="mt-2 text-[10px] text-[#6b8977]">Peduli dan Melayani</i>
            </div>
            <div className="absolute right-0 top-5 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[10px] leading-relaxed text-[#204d37] shadow-xl sm:right-1"><Users size={18}/><span>Guyub<br/><b className="text-[11px]">dan Bersatu</b></span></div>
            <div className="absolute bottom-5 left-0 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[10px] leading-relaxed text-[#204d37] shadow-xl"><i className="h-2 w-2 rounded-full bg-[#6eae75] ring-4 ring-[#e4f2e6]"/> <span>Informasi & layanan<br/><b className="text-[11px]">anggota</b></span></div>
          </div>
        </div>
        <div className="border-t border-white/15"><div className={container+" flex h-12 items-center justify-between text-[9px] font-bold tracking-[1.4px] text-[#d7e9dc]"}><span>Peduli dan Melayani</span><span>HIMPANA · CABANG BANDUNG</span></div></div>
      </section>

      <section id="tentang" className="bg-[#f6f9f6] py-14 sm:py-20">
        <div className={container+" grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]"}>
          <div className="mb-2 md:col-span-2 lg:col-span-1 lg:my-auto"><span className="text-[10px] font-extrabold tracking-[1.7px] text-[#27784e]">DATA ANGGOTA</span><h2 className="my-3 text-3xl font-extrabold leading-tight tracking-tight text-[#173c2b]">Terus terhubung,<br/>terus diperbarui.</h2><p className="max-w-[340px] text-xs leading-7 text-[#75857b]">Pembaruan data membantu memastikan informasi anggota tetap akurat dan pelayanan berjalan lebih baik.</p></div>
          {[{value:stats.total,label:"Total Anggota",desc:"Terdaftar dalam database cabang",Icon:Users},{value:stats.dataUlang,label:"Sudah Data Ulang",desc:"Anggota dengan status data ulang selesai",Icon:ClipboardCheck}].map((s,i)=><div key={s.label} className={"flex min-h-[170px] flex-col items-start justify-center rounded-xl border p-6 "+(i?"border-[#176f49] bg-[#176f49] text-white":"border-[#e8eee9] bg-white text-[#18372a]")}><span className={"grid h-11 w-11 place-items-center rounded-xl "+(i?"bg-white/15 text-white":"bg-[#eaf4ed] text-[#176f49]")}><s.Icon size={21}/></span><strong className="my-3 text-4xl font-extrabold">{s.value.toLocaleString("id-ID")}</strong><b className="text-xs">{s.label}</b><small className={"mt-1.5 text-[10px] "+(i?"text-[#d0e5d7]":"text-[#87948c]")}>{s.desc}</small></div>)}
        </div>
      </section>

      <section id="mutasi" className="bg-white py-14 sm:py-20"><div className={container}>
        <div className="mb-7 flex items-end justify-between gap-5"><div><span className="text-[10px] font-extrabold tracking-[1.7px] text-[#27784e]">INFORMASI ANGGOTA</span><h2 className="mb-2 mt-3 text-3xl font-extrabold text-[#173c2b]">Mutasi Anggota</h2><p className="text-xs leading-6 text-[#75857b]">Informasi perubahan data dan kabar anggota HIMPANA Cabang Bandung.</p></div><span className="hidden text-[9px] font-extrabold tracking-widest text-[#9aa79e] sm:block">01 / INFORMASI</span></div>
        {deaths.length ? <div className="overflow-x-auto rounded-xl border border-[#e7eee8]"><table className="w-full min-w-[650px] border-collapse text-left text-xs"><thead className="bg-[#f8faf9] text-[10px] uppercase text-[#78857d]"><tr>{["Nama Anggota","Nomor Pensiun","Tanggal Meninggal","Keterangan"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{deaths.map(x=><tr key={x.id} className="border-t border-[#edf1ee] text-[#435148]"><td className="px-4 py-3 font-bold">{x.nama}</td><td className="px-4 py-3">{x.nomor_pensiun||"-"}</td><td className="px-4 py-3">{new Date(x.tanggal_meninggal).toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"})}</td><td className="px-4 py-3">{x.keterangan||"-"}</td></tr>)}</tbody></table></div> : <div className="flex items-start gap-4 rounded-xl border border-[#e7eee8] bg-[#fbfdfb] p-5 sm:items-center sm:gap-5 sm:p-7"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf4ed] text-xl text-[#28794e]">✳</span><div><h3 className="mb-1.5 text-sm font-bold text-[#18372a]">Belum ada informasi mutasi</h3><p className="text-[11px] leading-6 text-[#7a8980]">Data anggota yang telah meninggal dunia akan ditampilkan di bagian ini setelah dicatat oleh pengurus.</p></div><span className="ml-auto hidden whitespace-nowrap rounded-full bg-[#edf5ef] px-3 py-2 text-[9px] font-bold text-[#37774f] sm:block">Data mutasi</span></div>}
      </div></section>

      <section className="bg-[#0f5036] py-14 text-white sm:py-20"><div className={container+" grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-[75px]"}>
        <div className="relative flex h-[230px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#277d52] to-[#0b422d] sm:h-[330px]"><div className="absolute h-[280px] w-[280px] rounded-full border border-white/15"/><div className="absolute h-[360px] w-[360px] rounded-full border border-white/15"/><strong className="z-10 text-[110px] font-extrabold text-white/85 sm:text-[150px]">H</strong><span className="z-10 text-[10px] font-extrabold tracking-[3px]">HIMPANA BANDUNG</span></div>
        <div><span className="text-[10px] font-extrabold tracking-[1.7px] text-[#b8dcae]">SAMBUTAN KETUA</span><h2 className="my-4 text-3xl font-extrabold leading-tight sm:text-[32px]">Menjaga kebersamaan,<br/><em className="not-italic text-[#bce3a9]">menghargai pengabdian.</em></h2><p className="text-xs leading-7 text-[#d2e4d8]">Selamat datang di website HIMPANA Cabang Bandung. Website ini menjadi sarana informasi dan komunikasi bagi anggota, sekaligus mendukung pembaruan data agar pelayanan organisasi semakin tertata.</p><p className="mt-3 text-xs leading-7 text-[#d2e4d8]">Semoga semangat kekeluargaan dan silaturahmi senantiasa terjaga di antara seluruh keluarga besar pensiunan Pertamina.</p><div className="mt-7 border-t border-white/25 pt-4"><strong className="block text-xs">Ketua HIMPANA Cabang Bandung</strong><small className="mt-1 block text-[10px] text-[#b9d2c1]">Perhimpunan Pensiunan Pertamina</small></div></div>
      </div></section>

      <section id="lokasi" className="bg-[#f6f9f6] py-14 sm:py-20"><div className={container+" grid items-center gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14"}>
        <div><span className="text-[10px] font-extrabold tracking-[1.7px] text-[#27784e]">KUNJUNGI KAMI</span><h2 className="my-3 text-3xl font-extrabold leading-tight text-[#173c2b]">Lokasi HIMPANA<br/>Cabang Bandung</h2><p className="max-w-[340px] text-xs leading-7 text-[#75857b]">Informasi alamat kantor dan petunjuk lokasi cabang akan ditampilkan di sini.</p><div className="mt-7 flex items-start gap-3 text-[#26774b]"><MapPin size={19}/><span><b className="block text-xs text-[#274b36]">Kantor HIMPANA Cabang Bandung</b><small className="mt-1 block text-[10px] text-[#829087]">Alamat kantor menunggu konfirmasi pengurus.</small></span></div></div>
        <div className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#d5e5d9] bg-gradient-to-br from-[#e3eee5] to-[#d3e4d7] text-[#33794f] sm:min-h-[285px]"><MapPin size={35}/><b className="text-sm text-[#285c3c]">HIMPANA Cabang Bandung</b><span className="text-[10px] text-[#6e8876]">Lokasi kantor akan diperbarui</span></div>
      </div></section>

      <section id="pengurus" className="bg-white py-14 sm:py-20"><div className={container}>
        <div className="mb-7 flex items-end justify-between gap-5"><div><span className="text-[10px] font-extrabold tracking-[1.7px] text-[#27784e]">ORGANISASI</span><h2 className="mb-2 mt-3 text-3xl font-extrabold text-[#173c2b]">Pengurus Cabang</h2><p className="text-xs leading-6 text-[#75857b]">Berkenalan dengan pengurus HIMPANA Cabang Bandung.</p></div><span className="hidden text-[9px] font-extrabold tracking-widest text-[#9aa79e] sm:block">02 / ORGANISASI</span></div>
        <div className="flex items-center gap-4 rounded-xl border border-[#e8eee9] p-5"><span className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-[#eaf4ed] text-2xl font-extrabold text-[#176f49]">H</span><div><b className="text-[13px]">Pengurus HIMPANA Cabang Bandung</b><p className="mt-1.5 text-[11px] text-[#7d8b82]">Susunan nama dan jabatan pengurus akan ditampilkan setelah data resmi tersedia.</p></div></div>
      </div></section>

      <section id="kontak" className="bg-[#eaf3ec] py-12 sm:py-[60px]"><div className={container+" flex flex-col justify-between gap-8 lg:flex-row lg:items-center"}>
        <div><span className="text-[10px] font-extrabold tracking-[1.7px] text-[#27784e]">HUBUNGI KAMI</span><h2 className="my-3 text-3xl font-extrabold leading-tight text-[#173c2b]">Ada pertanyaan atau<br/>butuh bantuan?</h2><p className="text-[11px] text-[#74857a]">Silakan hubungi pengurus HIMPANA Cabang Bandung melalui kontak resmi.</p></div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"><div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e2ebe4] bg-white p-4 sm:min-w-[210px]"><Phone size={20} className="text-[#26774b]"/><span><small className="block text-[9px] text-[#87948b]">Call Center / WhatsApp</small><b className="mt-1 block text-[11px] text-[#284d37]">Informasi kontak menyusul</b></span></div><div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e2ebe4] bg-white p-4 sm:min-w-[210px]"><Mail size={20} className="text-[#26774b]"/><span><small className="block text-[9px] text-[#87948b]">Email</small><b className="mt-1 block text-[11px] text-[#284d37]">Informasi email menyusul</b></span></div></div>
      </div></section>

      <footer className="bg-[#103e2c] text-white"><div className={container+" flex flex-col items-start justify-between gap-5 py-9 lg:flex-row lg:items-center"}>
        <Link href="/" className="flex items-center gap-3"><img className="h-11 w-[118px] object-contain object-left brightness-0 invert" src="https://himpana.com/logo-himpana.png" alt="Logo HIMPANA"/><span><strong className="block font-extrabold">HIMPANA</strong><small className="block text-[11px] text-[#b6cfc0]">Cabang Bandung</small></span></Link>
        <p className="text-[10px] leading-6 text-[#c0d5c7]">Peduli dan Melayani.<br/>Menjaga silaturahmi keluarga besar pensiunan Pertamina.</p>
        <div className="flex flex-wrap gap-4 text-[10px] font-bold text-[#d5e4d9]"><a href="#beranda">Beranda</a><a href="#tentang">Tentang</a><a href="#pengurus">Pengurus</a><a href="#kontak">Kontak</a><Link href="/login">Login Admin</Link></div>
      </div><div className={container+" flex flex-col gap-2 border-t border-white/15 py-4 text-[9px] text-[#b4cbbd] sm:flex-row sm:justify-between"}><span>© {new Date().getFullYear()} HIMPANA Cabang Bandung.</span><span>Perhimpunan Pensiunan Pertamina</span></div></footer>
    </main>
  );
}
