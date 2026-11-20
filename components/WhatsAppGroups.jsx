"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, CheckCircle2 } from "lucide-react";

export default function WhatsAppGroups() {
  const [groups, setGroups] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [gr, sr] = await Promise.all([
        fetch("/api/whatsapp/groups", { cache: "no-store" }),
        fetch("/api/whatsapp/settings", { cache: "no-store" }),
      ]);
      const [gd, sd] = await Promise.all([gr.json(), sr.json()]);
      if (!gr.ok) throw new Error(gd.error || "Gagal memuat grup WhatsApp.");
      if (!sr.ok) throw new Error(sd.error || "Gagal memuat pengaturan grup.");
      setGroups(gd.groups || []);
      setSelectedId(sd.selectedGroup || "");
    } catch (e) { setError(e.message || "Gagal memuat grup."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("id");
    const result = q ? groups.filter(g => g.name.toLocaleLowerCase("id").includes(q)) : groups;
    return result.slice(0, 3);
  }, [groups, query]);

  async function choose(group) {
    setSaving(group.id); setNotice(""); setError("");
    try {
      const r = await fetch("/api/whatsapp/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal menyimpan grup.");
      setSelectedId(group.id);
      setNotice(`Grup "${group.name}" dipilih untuk notifikasi iuran.`);
    } catch (e) { setError(e.message || "Gagal menyimpan grup."); }
    finally { setSaving(""); }
  }

  const selected = groups.find(g => g.id === selectedId);
  return <section className="wa-groups">
    <div className="wa-groups-head">
      <div><h3>Grup Notifikasi Iuran</h3><p>Pilih grup tujuan ucapan selamat pembayaran iuran.</p></div>
      <button type="button" onClick={load} disabled={loading}><RefreshCw size={13} className={loading ? "wa-spin" : ""}/> Perbarui</button>
    </div>
    <div className="wa-selected-group">
      <div className="wa-selected-info"><small>GRUP AKTIF UNTUK IURAN</small><strong>{selected?.name || (selectedId ? "Grup tersimpan" : "Belum ada grup dipilih")}</strong><span>{selectedId || "Pilih grup di bawah untuk mengaktifkan notifikasi."}</span></div>
      {selectedId && <CheckCircle2 size={18} className="wa-selected-check"/>}
    </div>
    {notice && <div className="wa-feedback success">{notice}</div>}
    {error && <div className="wa-feedback error">{error}</div>}
    <div className="wa-group-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama grup WhatsApp..."/></div>
    {loading ? <div className="wa-groups-message">Mengambil daftar grup...</div> :
      visible.length ? <div className="wa-groups-list">{visible.map(group => {
        const active = selectedId === group.id;
        return <div className={`wa-group-row ${active ? "active" : ""}`} key={group.id}>
          <div className="wa-group-info"><strong>{group.name}</strong><code>{group.id}</code></div>
          <button type="button" disabled={active || saving === group.id} onClick={() => choose(group)}>{saving === group.id ? "Menyimpan..." : active ? "✓ Digunakan" : "Gunakan grup"}</button>
        </div>;
      })}</div> : <div className="wa-groups-message">{groups.length ? "Grup tidak ditemukan." : "Belum ada grup. Pastikan WhatsApp terhubung."}</div>}
    {!loading && groups.length > 3 && <p className="wa-groups-hint">{query ? "Hasil pencarian dibatasi 3 grup." : "Menampilkan 3 grup pertama. Cari grup lain melalui kolom pencarian."}</p>}
  </section>;
}
