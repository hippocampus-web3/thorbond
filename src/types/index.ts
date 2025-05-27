export interface NodeOperatorFormData {
  address: string;
  totalBondTarget: string;
  minimumBond: string;
  feePercentage: string;
  description?: string;
  contactInfo?: string;
}

export interface WhitelistRequestFormData {
  walletAddress: string;
  intendedBondAmount: string;
}

export interface WhitelistRequestParams {
  nodeAddress: string;
  userAddress: string;
  amount: number;
}
export interface ListingParams {
  nodeAddress: string;
  operatorAddress: string;
  minRune: number;
  totalBondTarget: number;
  feePercentage: number;
}

export interface ListingMemo {
  nodeAddress: string;
  operatorAddress: string;
  minRune: number;
  maxRune: number;
  feePercentage: number;
}

export interface SendMessageParams {
  nodeAddress: string;
  senderAddress: string;
  message: string;
  role: 'USER' | 'BP' | 'NO';
}

export interface ThorchainTransferParams {
  asset: {
    chain: string;
    symbol: string;
    ticker: string;
  };
  from: string;
  recipient?: string;
  amount: {
    amount: number;
    decimals: number;
  };
  memo?: string;
}
