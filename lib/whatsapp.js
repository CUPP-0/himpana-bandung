import { Client, LocalAuth } from "whatsapp-web.js";

const g = globalThis;

function state() {
  return (
    g.himpanaWaState ||
    (g.himpanaWaState = {
      client: null,
      ready: false,
      qr: null,
      starting: false,
      lastError: null,
      groupsPromise: null,
    })
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientPageError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("detached frame") ||
    message.includes("execution context was destroyed") ||
    message.includes("target closed") ||
    message.includes("session closed") ||
    message.includes("frame was detached") ||
    message.includes("navigation")
  );
}

export function getWhatsAppState() {
  const s = state();
  return {
    ready: s.ready,
    qr: s.qr,
    starting: s.starting,
    lastError: s.lastError,
  };
}

export async function getWhatsAppGroups() {
  const s = state();

  if (!s.ready || !s.client) {
    throw new Error("WhatsApp belum terhubung. Scan QR terlebih dahulu.");
  }

  // Hindari beberapa request getChats() berjalan bersamaan pada satu tab WhatsApp Web.
  if (s.groupsPromise) return s.groupsPromise;

  const client = s.client;
  s.groupsPromise = (async () => {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        if (!s.ready || s.client !== client) {
          throw new Error("Koneksi WhatsApp berubah. Silakan coba perbarui daftar grup.");
        }

        if (client.pupPage?.isClosed?.()) {
          throw new Error("Tab WhatsApp Web tertutup. Hubungkan ulang WhatsApp.");
        }

        const chats = await client.getChats();

        if (!s.ready || s.client !== client) {
          throw new Error("Koneksi WhatsApp terputus saat mengambil daftar grup.");
        }

        return chats
          .filter((chat) => chat.isGroup)
          .map((chat) => ({
            name: chat.name || "Grup tanpa nama",
            id: chat.id?._serialized,
          }))
          .filter((group) => group.id)
          .sort((a, b) => a.name.localeCompare(b.name, "id"));
      } catch (error) {
        lastError = error;

        if (!isTransientPageError(error) || attempt === 3) {
          break;
        }

        // Beri waktu Puppeteer/WhatsApp Web menyelesaikan navigasi atau pemuatan ulang.
        await sleep(700 * attempt);
      }
    }

    if (isTransientPageError(lastError)) {
      throw new Error(
        "WhatsApp Web sedang memuat ulang. Tunggu beberapa detik, lalu tekan Perbarui kembali.",
      );
    }

    throw lastError || new Error("Gagal mengambil daftar grup WhatsApp.");
  })();

  try {
    return await s.groupsPromise;
  } finally {
    s.groupsPromise = null;
  }
}

export async function startWhatsApp() {
  const s = state();
  if (s.ready || s.starting) return getWhatsAppState();

  s.starting = true;
  s.lastError = null;

  try {
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: process.env.WA_CLIENT_ID || "himpana-bandung",
        dataPath: process.env.WA_SESSION_PATH || "./.wwebjs_auth",
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      },
    });

    s.client = client;

    client.on("qr", (qr) => {
      s.qr = qr;
      s.ready = false;
      s.starting = false;
      s.groupsPromise = null;
    });

    client.on("ready", () => {
      s.ready = true;
      s.qr = null;
      s.starting = false;
      s.lastError = null;
      s.groupsPromise = null;
    });

    client.on("authenticated", () => {
      s.qr = null;
    });

    client.on("auth_failure", (message) => {
      s.ready = false;
      s.starting = false;
      s.groupsPromise = null;
      s.lastError = String(message);
    });

    client.on("disconnected", (message) => {
      s.ready = false;
      s.starting = false;
      s.groupsPromise = null;
      s.lastError = String(message);
    });

    client.initialize().catch((error) => {
      s.ready = false;
      s.starting = false;
      s.lastError = error?.message || "Gagal memulai WhatsApp.";
    });

    return getWhatsAppState();
  } catch (error) {
    s.ready = false;
    s.starting = false;
    s.lastError = error?.message || "Gagal memulai WhatsApp.";
    return getWhatsAppState();
  }
}

export async function sendWhatsApp(target, message) {
  const s = state();

  if (!s.ready || !s.client) {
    return {
      sent: false,
      reason: "WhatsApp belum terhubung. Scan QR melalui panel server.",
    };
  }

  try {
    let chatId = target;
    if (!String(target).endsWith("@g.us")) {
      chatId = String(target).replace(/\D/g, "") + "@c.us";
    }

    const sent = await s.client.sendMessage(chatId, message);
    return { sent: !!sent, id: sent?.id?._serialized };
  } catch (error) {
    return { sent: false, reason: error?.message || "Gagal mengirim pesan WhatsApp." };
  }
}

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const paymentMessage = (name, period) => {
  const formattedPeriod = String(period).replace(
    /(^|\s)(1[0-2]|[1-9])(?=\s*\/)/,
    (_, prefix, month) => prefix + monthNames[Number(month) - 1],
  );

  return `🎉 *SELAMAT DAN TERIMA KASIH!*\n\nTerima kasih kepada *${name}* yang telah melakukan pembayaran iuran HIMPANA periode *${formattedPeriod}*.\n\nSemoga senantiasa diberikan kesehatan dan keberkahan.\n\nPengurus HIMPANA Bandung.`;
};

export const dataUlangMessage = (name) =>
  `Assalamu'alaikum Bapak/Ibu *${name}*.\n\nKami informasikan bahwa proses data ulang keanggotaan HIMPANA telah mencapai status *YES OPEN (YO)*. Terima kasih telah melakukan proses data ulang.\n\nSalam hangat, Pengurus HIMPANA Bandung.`;
