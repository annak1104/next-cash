import { NextRequest, NextResponse } from "next/server";

import { getCryptoPrices } from "@/data/getCryptoPrices";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 },
    );
  }

  try {
    const prices = await getCryptoPrices([id]);
    const priceData = prices[id];

    if (!priceData) {
      return NextResponse.json(
        { error: "Price not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(priceData);
  } catch (error) {
    console.error("Crypto price API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto price" },
      { status: 500 },
    );
  }
}








