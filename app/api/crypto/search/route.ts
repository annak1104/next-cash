import { NextRequest, NextResponse } from "next/server";

import { searchCrypto } from "@/data/searchCrypto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const results = await searchCrypto(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Crypto search API error:", error);
    return NextResponse.json(
      { error: "Failed to search cryptocurrencies" },
      { status: 500 },
    );
  }
}





