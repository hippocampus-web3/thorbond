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

export interface VultisigThorchainRequest {
  method: 'send_transaction' | 'deposit_transaction' | 'get_accounts' | 'request_accounts' | 'bond' | 'unbond';
  params?: [{
    from?: string;
    to?: string;
    data?: string;
    value?: string;
    asset?: ThorchainAsset;
    amount?: ThorchainAmount;
  }];
}

export interface VultisigThorchainProvider {
  request: (request: VultisigThorchainRequest) => Promise<any>;
}

// Wallet provider interfaces
export interface VultisigProvider {
  thorchain: VultisigThorchainProvider;
}

export interface ThorchainProvider {
  request: (
    request: ThorchainRequest,
    callback: (error: Error | null, result: any) => void
  ) => void;
}

export interface XDEFIProvider {
  thorchain: ThorchainProvider;
}

export interface KeplrProvider {
  enable: (chainId: string) => Promise<void>;
  experimentalSuggestChain: any;
  getOfflineSignerOnlyAmino: any
}

// Update WalletProvider type
export type WalletProvider = ThorChainClient | VultisigThorchainProvider | ThorchainProvider | KeplrProvider;

// Global window interface
declare global {
  interface Window {
    vultisig?: VultisigProvider;
    xfi?: XDEFIProvider;
    ctrlEthProviders?: Record<string, any>;
    keplr?: KeplrProvider;
  }
} 