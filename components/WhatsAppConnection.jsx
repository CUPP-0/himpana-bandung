"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MessageCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

export default function WhatsAppConnection() {
  const [status, setStatus] = useState({ ready: false, qr: null, starting: false, lastError: null });
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let timer;

    const refresh = async () => {
      try {
        const response = await fetch("/api/whatsapp/status", { cache: "no-store" });
        const data = await response.json();
        if (!active) return;
        setStatus(data);
        if (data.qr) {
          const image = await QRCode.toDataURL(data.qr, {
            width: 240,
            margin: 2,
            errorCorrectionLevel: "M",
          });
          if (active) setQrImage(image);
        } else {
          setQrImage("");
        }
      } catch (error) {
        if (active) setStatus((old) => ({ ...old, lastError: error.message }));
      } finally {
        if (active) setLoading(false);
      }
    };

    refresh();
    timer = setInterval(refresh, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="wa-connection">
      <div className="wa-connection-head">
        <div className="wa-title">
          <MessageCircle size={18} />
          <div>
            <strong>WhatsApp Gateway</strong>
            <small>
              {status.ready ? "Terhubung" : status.qr ? "Menunggu scan QR" : status.starting || loading ? "Menghubungkan..." : "Belum terhubung"}
            </small>
          </div>
        </div>
        <span className={`wa-status-dot ${status.ready ? "online" : "offline"}`} />
      </div>

      {status.ready ? (
        <div className="wa-connected">
          <Wifi size={20} />
          <span>WhatsApp berhasil terhubung. Notifikasi otomatis aktif.</span>
        </div>
      ) : status.qr && qrImage ? (
        <div className="wa-qr-wrap">
          <p>Buka WhatsApp di HP, pilih <b>Perangkat tertaut</b>, lalu <b>Tautkan perangkat</b> dan scan QR ini.</p>
          <img src={qrImage} alt="QR Code untuk menghubungkan WhatsApp" width="240" height="240" />
          <small>QR akan diperbarui otomatis jika kedaluwarsa.</small>
        </div>
      ) : (
        <div className="wa-waiting">
          <RefreshCw size={17} className={status.starting || loading ? "wa-spin" : ""} />
          <span>
            {status.lastError
              ? `Gagal memulai WhatsApp: ${status.lastError}`
              : "Menunggu QR dari server WhatsApp. Pastikan server mendukung Chromium/Puppeteer."}
          </span>
          <button type="button" onClick={() => { setLoading(true); fetch("/api/whatsapp/status", { cache: "no-store" }).then((r) => r.json()).then(setStatus).finally(() => setLoading(false)); }}>
            Coba lagi
          </button>
        </div>
      )}
    </div>
  );
}
