import { convertCurrency } from "@/lib/currency-converter";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const amount = Number(searchParams.get("amount"));

  if (!from || !to || !Number.isFinite(amount)) {
    return NextResponse.json(
      { success: false, error: "from, to, and amount are required" },
      { status: 400 },
    );
  }

  if (amount <= 0) {
    return NextResponse.json({ success: true, result: 0 });
  }

  try {
    const result = await convertCurrency(from, to, amount);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to convert currency:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert currency" },
      { status: 500 },
    );
  }
}
