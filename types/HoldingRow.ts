export interface HoldingRow {
  id: string;
  image: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  change24h: number;
  dailyPL: number;
  avgPrice: number;
  invested: number;
  marketValue: number;
  unrealizedPL: number;
  allocation: number;
}
