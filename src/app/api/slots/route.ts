import { NextResponse } from "next/server";
import { getDeliverySlots } from "@/lib/catalog";

export async function GET() {
  try {
    const slots = await getDeliverySlots();
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("GET /api/slots error:", err);
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
