export function formatRune(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(amount);
}

export function validateThorAddress(address: string): boolean {
  // Basic validation - in a real app, this would be more sophisticated
  return address.startsWith('thor') && address.length === 43;
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const getTimeAgo = (timestamp: number | Date): string => {
  let date: Date;
  
  if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    // Si es un número, asumimos que es un timestamp en nanosegundos
    date = new Date(Number(timestamp) / 1000000);
  }

  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  return `${diffInDays} days ago`;
};
