interface ThorchainAsset {
  chain: string;
  symbol: string;
  ticker: string;
}

interface ThorchainAmount {
  amount: number;
  decimals: number;
}

interface ThorchainTransferParams {
  asset: ThorchainAsset;
  from: string;
  recipient: string;
  amount: ThorchainAmount;
  memo: string;
  gasLimit?: string;
}

interface ThorchainRequest {
  method: 'transfer';
  params: [ThorchainTransferParams];
}

interface ThorchainProvider {
  request: (
    request: ThorchainRequest,
    callback: (error: Error | null, result: string) => void
  ) => void;
}

interface XFI {
  thorchain: ThorchainProvider;
}

interface Window {
  xfi?: XFI;
} 