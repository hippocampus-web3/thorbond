export interface NodeOperator {
  id: string;
  address: string;
  bondingCapacity: number;
  minimumBond: number;
  feePercentage: number;
  description?: string;
  contactInfo?: string;
  createdAt: Date;
}

export interface WhitelistRequest {
  id: string;
  nodeOperatorId: string;
  discordUsername: string;
  xUsername: string;
  telegramUsername: string;
  walletAddress: string;
  intendedBondAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  isNodeOperator: boolean;
}
