// Thorchain specific types
export interface ThorchainAsset {
  chain: string;
  symbol: string;
  ticker: string;
}

export interface ThorchainAmount {
  amount: number;
  decimals: number;
}

export interface ThorchainTransferParams {
  asset: ThorchainAsset;
  from: string;
  recipient?: string;
  amount: ThorchainAmount;
  memo: string;
  gasLimit?: string;
}

export interface ThorchainRequest {
  method: 'transfer' | 'request_accounts' | 'deposit';
  params: [ThorchainTransferParams] | [];
}

// Wallet provider interfaces
export interface VultisigProvider {
  thorchain: any;
}

export interface ThorchainProvider {
  request: (
    request: ThorchainRequest,
    callback: (error: Error | null, result: string) => void
  ) => void;
}

export interface XDEFIProvider {
  thorchain: ThorchainProvider;
}

// Global window interface
declare global {
  interface Window {
    vultisig?: VultisigProvider;
    xfi?: XDEFIProvider;
    ctrlEthProviders?: Record<string, any>;
  }
} 