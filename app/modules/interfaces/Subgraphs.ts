import { SupportedPools } from "./Networks";

export interface PoolToken {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  totalSupply: string;
  tradeVolumeUSD: string;
  totalLiquidity: string;
}

export interface PoolHourData {
  volumeUSD: string;
}

export interface PairDayData {
  pairDayDatas: { dailyVolumeUSD: string };
  pair: { hourData: string };
}

export interface SubgraphPair {
  id: string;
  token0Price: string;
  token1Price: string;
  reserve0: string;
  reserve1: string;
  reserveUSD: string;
  liquidityProviderCount: string;
  volumeToken0: string;
  volumeToken1: string;
  volumeUSD: string;
  token0: PoolToken;
  token1: PoolToken;
  key?: number;
  [key: string]: any;
  hourData: PoolHourData[];
}

export interface SubgraphPools {
  pairs: SubgraphPair[];
  factories: {
    pairCount: number;
  };
}

export interface ProtocolSettings {
  name: keyof SupportedPools;
  chainId: (1 | 56 | 137)[];
  repeatEach?: number
}

/**
 * Generic interface to a Subgraph Query object.
 *
 * This interface defines the default model for creating uniswap queries.
 *
 */
export interface QueryObj {
  /**
   * Create a query to fetch 100 items from the Uniswap GQL Api
   * @param page the page to fetch
   */
  pools: (page: number) => string;
  /**
   * Create a query to fetch a single pool based in its contract address
   * @param contractAddress
   */
  pool: (contractAddress: string) => string;

  /**
   * Create a query to fetch the pool pair data
   * @param contractAddress
   * @returns
   */
  pair: (contractAddress: string) => string;
  /**
   * Example query
   * @param someValue
   * @returns
   */
  example?: (someValue: unknown) => string;
}
