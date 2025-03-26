import { NodeOperator, WhitelistRequest, User } from '../types';

// Mock node operators
export const mockNodeOperators: NodeOperator[] = [
  {
    id: '1',
    address: 'thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9',
    bondingCapacity: 1000000,
    minimumBond: 100000,
    feePercentage: 16,
    description: 'Experienced node operator with high uptime',
    contactInfo: 'Discord: operator1#1234',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    address: 'thor1yazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap8',
    bondingCapacity: 2000000,
    minimumBond: 200000,
    feePercentage: 18,
    description: 'Professional node operator with 99.9% uptime',
    contactInfo: 'Telegram: @operator2',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    address: 'thor1zazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap7',
    bondingCapacity: 3000000,
    minimumBond: 300000,
    feePercentage: 20,
    description: 'Enterprise-grade node operator',
    contactInfo: 'X: @operator3',
    createdAt: new Date('2024-01-03'),
  },
];

// Mock whitelist requests
export const mockWhitelistRequests: WhitelistRequest[] = [
  {
    id: '1',
    nodeOperatorId: '1',
    discordUsername: 'user1#5678',
    xUsername: '@user1',
    telegramUsername: '@teleuser1',
    walletAddress: 'thor1uvwxyz0123456789abcdefghijklmnopqrst',
    intendedBondAmount: 10000,
    status: 'pending',
    createdAt: new Date('2023-06-15'),
  },
  {
    id: '2',
    nodeOperatorId: '1',
    discordUsername: 'user2#9012',
    xUsername: '@user2',
    telegramUsername: '@teleuser2',
    walletAddress: 'thor1xyz0123456789abcdefghijklmnopqrstuvw',
    intendedBondAmount: 15000,
    status: 'approved',
    createdAt: new Date('2023-06-10'),
  },
  {
    id: '3',
    nodeOperatorId: '2',
    discordUsername: 'user3#3456',
    xUsername: '@user3',
    telegramUsername: '@teleuser3',
    walletAddress: 'thor1z0123456789abcdefghijklmnopqrstuvwxy',
    intendedBondAmount: 12000,
    status: 'rejected',
    rejectionReason: 'Insufficient bond amount',
    createdAt: new Date('2023-06-05'),
  },
];

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    walletAddress: 'thor1abcdefghijklmnopqrstuvwxyz0123456789abcd',
    isNodeOperator: true,
  },
  {
    id: '2',
    walletAddress: 'thor1uvwxyz0123456789abcdefghijklmnopqrst',
    isNodeOperator: false,
  },
];

// Mock authentication function
export function mockAuthenticateWallet(address: string): User | null {
  return mockUsers.find(user => user.walletAddress === address) || null;
}
