export interface IPoolToken {
  id: string;
  symbol: string;
  name: string;
  decimals?: string;
  totalSupply?: string;
  tradeVolumeUSD?: string;
  totalLiquidity?: string;
}

export interface ILiquidityProvision {
  poolContractAddress: string;
  protocol: string;
  chainId: number;
  token0: IPoolToken;
  token1: IPoolToken;
}
