import { getUsdExchangeRates } from "@/lib/exchange-rates-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const conversionRates = await getUsdExchangeRates();
    return NextResponse.json({ success: true, conversion_rates: conversionRates });
  } catch (error) {
    console.error("Failed to fetch rates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exchange rates" },
      { status: 500 },
    );
  }
}
