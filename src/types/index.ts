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

