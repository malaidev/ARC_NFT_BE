
export interface IMarketOverview {
  market: Array<ISymbol>
  quotes: Array<IQuotes>
}

interface ISymbol {
  symbol: string
  quote: string
  volume: number
  price: number
  variationPrice: number
  variationPercent: string,
}

interface IQuotes {
  quote: string,
}