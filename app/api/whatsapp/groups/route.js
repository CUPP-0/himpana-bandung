import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getWhatsAppGroups } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const groups = await getWhatsAppGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    const message = error?.message || "Gagal mengambil daftar grup WhatsApp.";
    const status = message.includes("belum terhubung") ? 503 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
