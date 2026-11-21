import pool from "@/lib/db";
import Link from "next/link";
import { Users, ClipboardCheck, ArrowUpRight, MapPin, Phone, Mail, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPublicStats() {
  try {
    const [[stats]] = await pool.query(`
      SELECT COUNT(*) AS total,
      COALESCE(SUM(status_data_ulang NOT IN ('BLMDU','BWDU')),0) AS data_ulang
      FROM members
    `);
    return { total: Number(stats.total || 0), dataUlang: Number(stats.data_ulang || 0) };
  } catch {
    return { total: 0, dataUlang: 0 };
  }
}

export default async function PublicHome() {
  const stats = await getPublicStats();
  return (
    <main className="public-site">
      <header className="public-header">
        <Link href="/" className="public-brand">
          <span className="public-brand-mark">H</span>
          <span><strong>HIMPANA</strong><small>Cabang Bandung</small></span>
        </Link>
        <nav className="public-nav">
          <a href="#beranda">Beranda</a><a href="#tentang">Tentang</a><a href="#mutasi">Mutasi</a>
          <a href="#pengurus">Pengurus</a><a href="#kontak">Kontak</a>
        </nav>
        <div className="public-actions">
          <Link className="public-login" href="/login">Login Admin</Link>
          <Link className="public-register" href="/register">Data Ulang <ArrowUpRight size={16}/></Link>
        </div>
      </header>

      <section className="public-hero" id="beranda">
        <div className="hero-pattern" />
        <div className="public-container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><i/> PERHIMPUNAN PENSIUNAN PERTAMINA</span>
            <h1>Merawat Silaturahmi,<br/><em>Menguatkan Kebersamaan.</em></h1>
            <p>HIMPANA Cabang Bandung hadir sebagai wadah silaturahmi, komunikasi, dan pelayanan bagi keluarga besar pensiunan Pertamina.</p>
            <div className="hero-buttons">
              <Link href="/register" className="hero-cta">Ajukan Data Ulang <ArrowUpRight size={17}/></Link>
              <a href="#tentang" className="hero-secondary">Kenali HIMPANA <ChevronRight size={17}/></a>
            </div>
            <div className="hero-note"><span className="note-icon"><Users size={17}/></span><span>Terhubung dalam satu keluarga besar<br/><b>HIMPANA Cabang Bandung</b></span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
            <div className="hero-emblem"><span>H</span><small>HIMPANA</small><i>Peduli dan Melayani</i></div>
            <div className="hero-float float-top"><Users size={18}/><span>Guyub<br/><b>dan Bersatu</b></span></div>
            <div className="hero-float float-bottom"><span className="float-dot"/><span>Informasi & layanan<br/><b>anggota</b></span></div>
          </div>
        </div>
        <div className="hero-bottom"><div className="public-container hero-bottom-inner"><span>Peduli dan Melayani</span><span>HIMPANA · CABANG BANDUNG</span></div></div>
      </section>

      <section className="public-stats" id="tentang">
        <div className="public-container stats-inner">
          <div className="stats-intro"><span className="section-kicker">DATA ANGGOTA</span><h2>Terus terhubung,<br/>terus diperbarui.</h2><p>Pembaruan data membantu memastikan informasi anggota tetap akurat dan pelayanan berjalan lebih baik.</p></div>
          <div className="public-stat-card"><span className="stat-icon"><Users size={21}/></span><strong>{stats.total.toLocaleString("id-ID")}</strong><b>Total Anggota</b><small>Terdaftar dalam database cabang</small></div>
          <div className="public-stat-card featured"><span className="stat-icon"><ClipboardCheck size={21}/></span><strong>{stats.dataUlang.toLocaleString("id-ID")}</strong><b>Sudah Data Ulang</b><small>Anggota dengan status data ulang selesai</small></div>
        </div>
      </section>

      <section className="public-section mutation-section" id="mutasi">
        <div className="public-container">
          <div className="section-heading"><div><span className="section-kicker">INFORMASI ANGGOTA</span><h2>Mutasi Anggota</h2><p>Informasi perubahan data dan kabar anggota HIMPANA Cabang Bandung.</p></div><span className="section-index">01 / INFORMASI</span></div>
          <div className="mutation-empty"><span className="mutation-symbol">✳</span><div><h3>Informasi mutasi anggota</h3><p>Informasi anggota yang telah meninggal dunia akan ditampilkan pada bagian ini setelah data mutasi tersedia.</p></div><span className="coming-label">Pembaruan data</span></div>
        </div>
      </section>

      <section className="chair-section">
        <div className="public-container chair-grid">
          <div className="chair-visual"><div className="chair-monogram">H</div><span>HIMPANA BANDUNG</span></div>
          <div className="chair-copy"><span className="section-kicker">SAMBUTAN KETUA</span><h2>Menjaga kebersamaan,<br/><em>menghargai pengabdian.</em></h2><p>Selamat datang di website HIMPANA Cabang Bandung. Website ini menjadi sarana informasi dan komunikasi bagi anggota, sekaligus mendukung pembaruan data agar pelayanan organisasi semakin tertata.</p><p>Semoga semangat kekeluargaan dan silaturahmi senantiasa terjaga di antara seluruh keluarga besar pensiunan Pertamina.</p><div className="chair-sign"><strong>Ketua HIMPANA Cabang Bandung</strong><small>Perhimpunan Pensiunan Pertamina</small></div></div>
        </div>
      </section>

      <section className="public-section location-section" id="lokasi">
        <div className="public-container location-grid">
          <div><span className="section-kicker">KUNJUNGI KAMI</span><h2>Lokasi HIMPANA<br/>Cabang Bandung</h2><p>Informasi alamat kantor dan petunjuk lokasi cabang akan ditampilkan di sini.</p><div className="location-detail"><MapPin size={19}/><span><b>Kantor HIMPANA Cabang Bandung</b><small>Alamat kantor menunggu konfirmasi pengurus.</small></span></div></div>
          <div className="map-placeholder"><MapPin size={35}/><b>HIMPANA Cabang Bandung</b><span>Lokasi kantor akan diperbarui</span></div>
        </div>
      </section>

      <section className="public-section board-section" id="pengurus">
        <div className="public-container">
          <div className="section-heading"><div><span className="section-kicker">ORGANISASI</span><h2>Pengurus Cabang</h2><p>Berkenalan dengan pengurus HIMPANA Cabang Bandung.</p></div><span className="section-index">02 / ORGANISASI</span></div>
          <div className="board-placeholder"><div className="board-avatar">H</div><div><b>Pengurus HIMPANA Cabang Bandung</b><p>Susunan nama dan jabatan pengurus akan ditampilkan setelah data resmi tersedia.</p></div></div>
        </div>
      </section>

      <section className="contact-band" id="kontak"><div className="public-container contact-inner"><div><span className="section-kicker">HUBUNGI KAMI</span><h2>Ada pertanyaan atau<br/>butuh bantuan?</h2><p>Silakan hubungi pengurus HIMPANA Cabang Bandung melalui kontak resmi.</p></div><div className="contact-cards"><div><Phone size={20}/><span><small>Call Center / WhatsApp</small><b>Informasi kontak menyusul</b></span></div><div><Mail size={20}/><span><small>Email</small><b>Informasi email menyusul</b></span></div></div></div></section>

      <footer className="public-footer"><div className="public-container footer-main"><Link href="/" className="public-brand footer-brand"><span className="public-brand-mark">H</span><span><strong>HIMPANA</strong><small>Cabang Bandung</small></span></Link><p>Peduli dan Melayani.<br/>Menjaga silaturahmi keluarga besar pensiunan Pertamina.</p><div className="footer-links"><a href="#beranda">Beranda</a><a href="#tentang">Tentang</a><a href="#pengurus">Pengurus</a><a href="#kontak">Kontak</a><Link href="/login">Login Admin</Link></div></div><div className="public-container footer-bottom"><span>© {new Date().getFullYear()} HIMPANA Cabang Bandung.</span><span>Perhimpunan Pensiunan Pertamina</span></div></footer>
    </main>
  );
}