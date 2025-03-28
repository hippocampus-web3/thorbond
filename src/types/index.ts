export interface NodeOperatorFormData {
  address: string;
  bondingCapacity: string;
  minimumBond: string;
  feePercentage: string;
  description?: string;
  contactInfo?: string;
}
export interface Node {
  operator: string;
  address: string;
  status?: string;
  bondingCapacity: number;
  minimumBond: number;
  feePercentage: number;
  description?: string;
  contactInfo?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  isNodeOperator: boolean;
}

export interface WhitelistRequest {
  node: Node;
  walletAddress: string;
  intendedBondAmount: number;
  realBond: number,
  status: 'pending' | 'approved' | 'rejected' | 'bonded';
  rejectionReason?: string;
  createdAt: Date;
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

export interface ThorBondAction {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface MidgardAction {
  type: string;
  date: string;
  height: string;
  in: unknown[];
  out: unknown[];
  pools: string[];
  status: string;
  metadata: {
    send?: {
      code: string;
      memo: string;
      networkFees: Array<{
        amount: string;
        asset: string;
      }>;
      reason: string;
    };
  };
}

export interface ListingParams {
  nodeAddress: string;
  operatorAddress: string;
  minRune: number;
  maxRune: number;
  feePercentage: number;
}

export interface ListingMemo {
  nodeAddress: string;
  operatorAddress: string;
  minRune: number;
  maxRune: number;
  feePercentage: number;
}
