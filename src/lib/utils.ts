import { BaseAmount, baseToAsset } from "@xchainjs/xchain-util";

export function formatRune(baseAmount: BaseAmount): string {
  const amount = baseToAsset(baseAmount).amount().toNumber();
  
  if (amount === 0) {
    return '0';
  }

  const absAmount = Math.abs(amount);
  
  if (absAmount < 0.000001 || absAmount > 1000000000000) {
    return amount.toExponential(2);
  }
  
  if (absAmount >= 1000000000000) {
    const value = amount / 1000000000000;
    const decimal = value % 1;
    return `${decimal === 0 ? value : value.toFixed(3)}T`;
  }
  
  if (absAmount >= 1000000000) {
    const value = amount / 1000000000;
    const decimal = value % 1;
    return `${decimal === 0 ? value : value.toFixed(1)}B`;
  }
  
  if (absAmount >= 1000000) {
    const value = amount / 1000000;
    const decimal = value % 1;
    if (amount % 10000 === 0) {
      return `${decimal === 0 ? value : value.toFixed(2)}M`;
    }
    return `${decimal === 0 ? value : value.toFixed(1)}M`;
  }
  
  if (absAmount >= 1000) {
    const value = amount / 1000;
    const decimal = value % 1;
    if (amount % 10 === 0 && amount >= 10000) {
      return `${decimal === 0 ? value : value.toFixed(2)}K`;
    }
    if (amount % 100 === 0) {
      return `${decimal === 0 ? value : value.toFixed(1)}K`;
    }
    return `${decimal === 0 ? value : value.toFixed(1)}K`;
  }
  
  const decimal = amount % 1;
  return `${decimal === 0 ? amount : amount.toFixed(2)}`;
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'd' : 'd'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'h' : 'h'}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} ${minutes === 1 ? 'm' : 'm'}`);

  return parts.join(' ');
}

export function validateThorAddress(address: string): boolean {
  // Basic validation - in a real app, this would be more sophisticated
  return address.startsWith('thor') && address.length === 43;
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const getTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  return `${diffInDays} days ago`;
};

export const getNodeExplorerUrl = (nodeAddress: string): string => {
  return `https://thorchain.net/node/${nodeAddress}`;
};

export const getAddressExplorerUrl = (address: string): string => {
  return `https://thorchain.net/address/${address}`;
};
