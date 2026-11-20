import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getWhatsAppGroups } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const groups = await getWhatsAppGroups();

    return NextResponse.json(
      { success: true, groups },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const message = error?.message || "Gagal mengambil daftar grup WhatsApp.";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Sesi login berakhir. Silakan login kembali." },
        { status: 401 },
      );
    }

    const notReady = message.toLowerCase().includes("belum terhubung");
    return NextResponse.json(
      { success: false, error: message },
      { status: notReady ? 503 : 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
