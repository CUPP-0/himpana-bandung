"use client";

import { useCallback, useEffect, useState } from "react";

export default function WhatsAppGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/whatsapp/groups", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengambil daftar grup.");
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil grup.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  async function copyId(id) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("Clipboard tidak tersedia. Silakan salin ID grup secara manual.");
    }
  }

  return (
    <section className="wa-groups">
      <div className="wa-groups-head">
        <div>
          <h3>Daftar Grup WhatsApp</h3>
          <p>ID grup dapat disalin untuk kebutuhan notifikasi.</p>
        </div>
        <button type="button" onClick={loadGroups} disabled={loading}>
          {loading ? "Memuat..." : "↻ Perbarui"}
        </button>
      </div>
      {loading ? (
        <div className="wa-groups-message">Mengambil daftar grup WhatsApp...</div>
      ) : error ? (
        <div className="wa-groups-message">{error}</div>
      ) : groups.length === 0 ? (
        <div className="wa-groups-message">Belum ada grup yang ditemukan pada akun WhatsApp ini.</div>
      ) : (
        <>
          <div className="wa-groups-message">{groups.length} grup ditemukan.</div>
          <div className="wa-groups-list">
            {groups.map((group) => (
              <div className="wa-group-row" key={group.id}>
                <div className="wa-group-info">
                  <strong>{group.name}</strong>
                  <code>{group.id}</code>
                </div>
                <button type="button" onClick={() => copyId(group.id)}>
                  {copied === group.id ? "Tersalin ✓" : "Salin ID"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
