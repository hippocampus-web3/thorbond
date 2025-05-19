export interface NodeOperatorFormData {
  address: string;
  totalBondTarget: string;
  minimumBond: string;
  feePercentage: string;
  description?: string;
  contactInfo?: string;
}
export interface Node {
  operatorAddress: string;
  nodeAddress: string;
  status?: string;
  maxRune: number;
  minRune: number;
  feePercentage: number;
  txId: string;
  height: number;
  timestamp: string;
  slashPoints: number;
  activeTime: number;
  bondProvidersCount: number;
  description?: string;
  contactInfo?: string;
  maxTimeToLeave: number;
  isDelisted: boolean;
  officialInfo: {
    currentFee: number;
    totalBond: number;
  },
  isHidden: {
      hide: boolean,
      reasons: null | string[]
  }
  isYieldGuarded: {
    hide: boolean,
    reasons: null | string[]
  }
}

export interface WhitelistRequest {
  node: Node;
  userAddress: string;
  intendedBondAmount: number;
  realBond: number,
  status: 'pending' | 'approved' | 'rejected' | 'bonded';
  rejectionReason?: string;
  timestamp: string;
  txId: string;
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

export interface Message {
  message: string;
  userAddress: string;
  nodeAddress: string;
  timestamp: Date;
  role: 'BP' | 'NO' | 'USER';
  txId: string;
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
