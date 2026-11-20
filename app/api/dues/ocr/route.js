import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const OCR_PROMPT = `
Baca gambar bukti transfer dan ekstrak informasi yang benar-benar terlihat.
Kembalikan HANYA satu objek JSON valid tanpa markdown dengan properti:
{
  "nama_pengirim": string | null,
  "nominal": number | null,
  "nomor_rekening": string | null,
  "nama_bank": string | null,
  "tanggal": "YYYY-MM-DD" | null,
  "waktu": string | null,
  "catatan": string | null
}
Nominal harus berupa angka rupiah tanpa pemisah. Jangan menebak atau mengarang.
Jika informasi tidak terlihat atau tidak terbaca, isi null.
Ini hanya ekstraksi teks; jangan menyatakan transaksi asli, valid, atau berhasil.
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const content = [
    ...(Array.isArray(data.outputs) ? data.outputs : []),
    ...(Array.isArray(data.steps) ? data.steps : []),
  ].flatMap((item) => item?.content || []);

  return content
    .filter((item) => item?.type === "text" || typeof item?.text === "string")
    .map((item) => item.text || "")
    .join("\n")
    .trim();
}

function parseJson(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("Gemini tidak mengembalikan JSON yang valid. Coba gambar yang lebih jelas.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGemini({ apiKey, model, imageBase64, mimeType }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`;
  let lastResponse;
  let lastData;

  // Maksimal 3 percobaan per model, hanya untuk error sementara.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          store: false,
          input: [
            { type: "text", text: OCR_PROMPT },
            {
              type: "image",
              data: imageBase64,
              mime_type: mimeType,
            },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
        cache: "no-store",
      });
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 350));
      continue;
    }

    const data = await response.json().catch(() => ({}));
    if (response.ok) return data;

    lastResponse = response;
    lastData = data;

    const retryable =
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500;

    if (!retryable || attempt === 3) break;

    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 15000)
      : 1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 350);

    await sleep(delay);
  }

  const error = new Error(
    lastData?.error?.message ||
      lastData?.message ||
      `Gemini gagal memproses gambar (HTTP ${lastResponse?.status || "tidak diketahui"}).`,
  );
  error.status = lastResponse?.status || 502;
  error.providerStatus = lastData?.error?.status || "";
  throw error;
}

function publicGeminiError(error) {
  const status = Number(error?.status || 0);

  if (status === 503 || status >= 500) {
    return "Layanan Gemini sedang sibuk atau mengalami gangguan. Sistem sudah mencoba ulang. Silakan coba beberapa saat lagi.";
  }
  if (status === 429) {
    return "Batas penggunaan Gemini sedang tercapai. Silakan tunggu sebelum mencoba kembali.";
  }
  if (status === 401 || status === 403) {
    return "Akses Gemini ditolak. Periksa GEMINI_API_KEY dan izin project Google AI Studio.";
  }
  if (status === 404) {
    return "Model Gemini tidak ditemukan atau tidak tersedia untuk API key ini. Periksa GEMINI_MODEL.";
  }

  return error?.message || "Gemini OCR gagal memproses bukti transfer.";
}

export async function POST(req) {
  try {
    await requireAdmin();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi." },
        { status: 503 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file.arrayBuffer !== "function" || !file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Unggah gambar bukti transfer." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 10 MB." }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const primaryModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim();
    const models = [...new Set([primaryModel, fallbackModel].filter(Boolean))];

    let data;
    let lastError;

    for (const model of models) {
      try {
        data = await callGemini({
          apiKey,
          model,
          imageBase64: bytes.toString("base64"),
          mimeType: file.type,
        });
        break;
      } catch (error) {
        lastError = error;
        console.error(`Gemini OCR failed for model ${model}:`, {
          status: error.status,
          message: error.message,
        });

        // Jangan fallback untuk kesalahan request, autentikasi, atau format.
        if (![408, 429, 500, 502, 503, 504].includes(Number(error.status))) {
          throw error;
        }
      }
    }

    if (!data) throw lastError || new Error("Semua model Gemini gagal.");

    const raw = extractOutputText(data);
    if (!raw) {
      console.error("Gemini returned no text:", data);
      throw new Error("Gemini tidak menghasilkan data. Coba gambar yang lebih jelas.");
    }

    const result = parseJson(raw);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
    }

    console.error("Dues OCR error:", error);
    const status = Number(error?.status || 0);
    const httpStatus =
      status === 429 ? 429 :
      status === 503 || status >= 500 ? 503 :
      status === 401 || status === 403 ? 502 :
      400;

    return NextResponse.json(
      { error: publicGeminiError(error) },
      { status: httpStatus },
    );
  }
}
