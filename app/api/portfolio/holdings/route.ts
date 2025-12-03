import { NextRequest, NextResponse } from "next/server";
import { getPortfolioHoldings } from "@/data/getPortfolioHoldings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const portfolioIdParam = searchParams.get("portfolioId");

    const portfolioId = portfolioIdParam
      ? Number.parseInt(portfolioIdParam, 10)
      : undefined;

    if (portfolioIdParam && Number.isNaN(portfolioId)) {
      return NextResponse.json(
        { error: "Invalid portfolioId" },
        { status: 400 }
      );
    }

    const holdings = await getPortfolioHoldings(portfolioId);
    return NextResponse.json(holdings);
  } catch (error) {
    console.error("Error fetching portfolio holdings:", error);
    return NextResponse.json(
      { error: "Failed to load portfolio holdings" },
      { status: 500 }
    );
  }
}
