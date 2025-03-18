import { NodeOperator, WhitelistRequest, User } from '../types';

// Mock node operators
export const mockNodeOperators: NodeOperator[] = [
  {
    id: '1',
    address: 'thor1abcdefghijklmnopqrstuvwxyz0123456789abcd',
    bondingCapacity: 100000,
    minimumBond: 5000,
    feePercentage: 16,
    instantChurnAmount: 20000,
    description: 'Reliable node operator with 99.9% uptime. Running since 2021.',
    contactInfo: 'Discord: operator1#1234',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    address: 'thor1defghijklmnopqrstuvwxyz0123456789abcdef',
    bondingCapacity: 250000,
    minimumBond: 10000,
    feePercentage: 15,
    instantChurnAmount: 50000,
    description: 'Professional node operation service with dedicated support.',
    contactInfo: 'Telegram: @operator2',
    createdAt: new Date('2023-03-22'),
  },
  {
    id: '3',
    address: 'thor1ghijklmnopqrstuvwxyz0123456789abcdefghi',
    bondingCapacity: 500000,
    minimumBond: 20000,
    feePercentage: 14.5,
    instantChurnAmount: 100000,
    description: 'Enterprise-grade infrastructure with multi-region redundancy.',
    contactInfo: 'X: @operator3',
    createdAt: new Date('2023-05-10'),
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
