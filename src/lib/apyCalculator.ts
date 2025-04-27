export interface NetworkData {
  block_timestamp: string;
  total_active_bond: string;
  total_earnings: string;
}

export interface APYData {
  date: string;
  apy: number;
}

/**
 * Calculates APY for a given point using the time difference between consecutive points
 * @param currentRow Current data point
 * @param previousRow Previous data point
 * @returns Calculated APY value
 */
const calculateAPYForPoint = (currentRow: NetworkData, previousRow: NetworkData): number => {
  const currentDate = new Date(currentRow.block_timestamp);
  const previousDate = new Date(previousRow.block_timestamp);
  
  const days = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
  const bond = Number(previousRow.total_active_bond) / 100_000_000;
  const earnings = Number(currentRow.total_earnings) / 100_000_000;
  
  if (bond <= 0) return 0;
  
  const periodsPerYear = 365 / days;
  return (earnings / bond) * periodsPerYear * 100;
};

/**
 * Generates APY data for a given range using consecutive points
 * @param networkData Array of network data points
 * @param range Number of days to include in the range
 * @returns Object containing labels and APY data
 */
export const generateAPYData = (networkData: NetworkData[], range: number): { labels: string[], datasets: { label: string, data: number[] }[] } => {
  // Filter data for the selected range
  let filtered = networkData;
  if (networkData.length > 0) {
    const lastDate = new Date(networkData[networkData.length - 1].block_timestamp);
    const minDate = new Date(lastDate);
    minDate.setDate(minDate.getDate() - range);
    filtered = networkData.filter(row => new Date(row.block_timestamp) >= minDate);
  }

  // Generate labels
  const labels = filtered.map((row) => {
    const date = new Date(row.block_timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: range > 365 ? '2-digit' : undefined 
    });
  });

  // Calculate APY for each point using consecutive points
  const apyData = filtered.map((row, index) => {
    if (index === 0) {
      // For the first point, use 3 days as default
      const bond = Number(row.total_active_bond) / 100_000_000;
      const earnings = Number(row.total_earnings) / 100_000_000;
      if (bond <= 0) return 0;
      const periodsPerYear = 365 / 3; // Use 3 days as default
      return (earnings / bond) * periodsPerYear * 100;
    }
    
    return calculateAPYForPoint(row, filtered[index - 1]);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Network APY',
        data: apyData
      }
    ]
  };
}; 