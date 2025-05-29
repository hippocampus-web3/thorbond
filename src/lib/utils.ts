import { BaseAmount, baseToAsset } from "@xchainjs/xchain-util";

export function formatRune(baseAmount: BaseAmount, showFullAmount: boolean = false): string {
  const amount = baseToAsset(baseAmount).amount().toNumber();
  
  if (amount === 0) return '0';
  
  // If showFullAmount is true, return the full number with 2 decimal places
  if (showFullAmount) {
    return amount.toFixed(2).replace(/\.?0+$/, '');
  }
  
  const absAmount = Math.abs(amount);
  
  // Handle scientific notation for very small or very large numbers
  if (absAmount < 0.000001 || absAmount > 1000000000000) {
    return amount.toExponential(2);
  }
  
  // Define thresholds and their corresponding suffixes and divisors
  const thresholds = [
    { value: 1000000000000, suffix: 'T', decimals: 2, divisor: 1000000000000 },
    { value: 1000000000, suffix: 'B', decimals: 2, divisor: 1000000000 },
    { value: 1000000, suffix: 'M', decimals: 2, divisor: 1000000 },
    { value: 1000, suffix: 'K', decimals: 2, divisor: 1000 }
  ];
  
  // Find the appropriate threshold
  for (const { value, suffix, decimals, divisor } of thresholds) {
    if (absAmount >= value) {
      const formatted = (amount / divisor).toFixed(decimals);
      // Remove trailing zeros after decimal point
      return formatted.replace(/\.?0+$/, '') + suffix;
    }
  }
  
  // For numbers less than 1000, show up to 2 decimal places
  return amount.toFixed(2).replace(/\.?0+$/, '');
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

export const getTransactionExplorerUrl = (txId: string): string => {
  return `https://thorchain.net/tx/${txId}`;
};

export const getSubdomainNodeAddress = (): string | null => {
  const host = window.location.host;
  const parts = host.split('.');
  
  if (parts.length === 2 || parts.length === 3) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== 'www' && !subdomain.includes('deploy-')) {
      return subdomain;
    }
  }
  return null;
};
