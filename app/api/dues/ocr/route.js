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
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Gemini tidak mengembalikan JSON yang valid. Coba gambar yang lebih jelas.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(req) {
  try {
    await requireAdmin();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi" },
        { status: 503 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file.arrayBuffer !== "function" || !file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Unggah gambar bukti transfer" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 10 MB" }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    // Gemini Interactions API (multimodal image input).
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          store: false,
          input: [
            { type: "text", text: OCR_PROMPT },
            {
              type: "image",
              data: bytes.toString("base64"),
              mime_type: file.type,
            },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Interactions API error:", data);
      const message = data.error?.message || data.message || "Gemini OCR gagal";
      return NextResponse.json({ error: message }, { status: response.status >= 500 ? 502 : 400 });
    }

    const raw = extractOutputText(data);
    if (!raw) {
      console.error("Gemini returned no text:", data);
      throw new Error("Gemini tidak menghasilkan data. Coba gambar yang lebih jelas.");
    }

    const result = parseJson(raw);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Dues OCR error:", error);
    return NextResponse.json(
      { error: error.message || "OCR gagal memproses bukti transfer" },
      { status: 500 },
    );
  }
}
