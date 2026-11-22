"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ClipboardCheck } from "lucide-react";

const opts = [
  ["YO", "Yes Open"],
  ["YWS", "Yes WS."],
  ["YWAC", "Yes WA Center"],
  ["YVKTR", "Yes Via Ktr DAPEN"],
  ["YVPOS", "Yes Via Pos"],
  ["YDPV", "Yes Dlm Proses Verifikasi"],
  ["BWDU", "Blm Wajib Data Ulang"],
  ["BLMDU", "Blm Data Ulang"],
];
const field = "h-10 rounded-lg border border-[#dfe7e2] bg-white px-3 text-xs outline-none focus:border-[#2563eb]";
const btn = "inline-flex items-center justify-center gap-2 rounded-lg border border-[#e7ede9] bg-white px-3 py-2.5 text-xs font-bold";

export default function DataUlang() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(null);

  async function load() {
    const response = await fetch("/api/data-ulang?" + new URLSearchParams({ q, status }));
    const data = await response.json();
    setRows(data.data || []);
  }

  useEffect(() => { load(); }, [q, status]);

  async function change(id, value) {
    setBusy(id);
    const response = await fetch("/api/data-ulang", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: value }),
    });
    const data = await response.json();
    setBusy(null);
    setMsg(response.ok
      ? (value === "YO"
        ? (data.whatsapp?.sent
          ? "Status YO tersimpan dan WA anggota terkirim."
          : `Status YO tersimpan, tetapi WA gagal: ${data.whatsapp?.reason || "Periksa koneksi dan nomor WA anggota."}`)
        : "Progres berhasil diperbarui.")
      : data.error);
    load();
  }

  const done = rows.filter((x) => !["BLMDU", "BWDU"].includes(x.status_data_ulang)).length;
  const stats = [
    ["Total anggota", rows.length],
    ["Sudah proses", done],
    ["Belum data ulang", rows.filter((x) => x.status_data_ulang === "BLMDU").length],
    ["Belum wajib", rows.filter((x) => x.status_data_ulang === "BWDU").length],
  ];

  return <>
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-extrabold">Data Ulang</h1>
        <p className="mt-1 text-xs text-[#718078]">Monitoring dan pembaruan progres data ulang anggota.</p>
      </div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eff6ff] px-3 py-1.5 text-[10px] font-bold text-[#1e40af]">
        <ClipboardCheck size={13}/> Monitoring Anggota
      </span>
    </div>
    {msg && <div className="mb-4 rounded-lg bg-[#eff6ff] p-3 text-xs text-[#1e40af]">{msg}</div>}
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(([label, value]) => <div key={label} className="rounded-xl border border-[#e7ede9] bg-white p-4">
        <label className="text-[11px] text-[#718078]">{label}</label>
        <strong className="mt-2 block text-2xl font-extrabold">{value}</strong>
      </div>)}
    </div>
    <div className="rounded-xl border border-[#e7ede9] bg-white p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input className={field + " min-w-0 flex-1"} placeholder="Cari nama atau nomor anggota..." value={q} onChange={(e) => setQ(e.target.value)}/>
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          {opts.map(([value, label]) => <option value={value} key={value}>{value} — {label}</option>)}
        </select>
        <button className={btn} onClick={load}><RefreshCw size={14}/></button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e7ede9]">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead className="bg-[#f8faf9] text-[10px] uppercase text-[#78857d]">
            <tr>{["Nama anggota", "Nomor pensiun", "Nomor KTA", "WhatsApp", "Status sekarang", "Ubah progres"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((x) => <tr key={x.id} className="border-t border-[#edf1ee]">
              <td className="px-4 py-3 font-bold">{x.nama}</td>
              <td className="px-4 py-3">{x.nomor_pensiun || "-"}</td>
              <td className="px-4 py-3">{x.nomor_anggota || "-"}</td>
              <td className="px-4 py-3">{x.no_wa || "-"}</td>
              <td className="px-4 py-3">
                <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + (x.status_data_ulang === "YO" ? "bg-[#eff6ff] text-[#1e40af]" : x.status_data_ulang === "BLMDU" ? "bg-[#fff0ee] text-[#c24a40]" : "bg-[#eaf2ff] text-[#3868ae]")}>{x.status_data_ulang}</span>
              </td>
              <td className="px-4 py-3">
                <select className={field} disabled={busy === x.id} value={x.status_data_ulang} onChange={(e) => change(x.id, e.target.value)}>
                  {opts.map(([value, label]) => <option key={value} value={value}>{value} — {label}</option>)}
                </select>
              </td>
            </tr>)}
            {!rows.length && <tr><td colSpan="6" className="p-8 text-center text-xs text-[#718078]">Anggota tidak ditemukan.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </>;
}
