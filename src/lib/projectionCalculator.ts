export interface ProjectionData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    fill: boolean;
    pointRadius: number;
    pointBackgroundColor: string;
    borderWidth: number;
  }[];
  conservative: number[];
  average: number[];
  optimistic: number[];
}

export const calculateProjections = (
  historicalAPYs: number[],
  initialInvestment: number,
  months: number
): ProjectionData => {
  const avgAPY = historicalAPYs.reduce((sum, apy) => sum + apy, 0) / historicalAPYs.length;
  const variance = historicalAPYs.reduce((sum, apy) => sum + Math.pow(apy - avgAPY, 2), 0) / historicalAPYs.length;
  const stdDev = Math.sqrt(variance);

  const conservativeAPY = Math.max(0, avgAPY - stdDev);
  const averageAPY = avgAPY;
  const optimisticAPY = avgAPY + stdDev;

  const rate3DaysConservative = Math.pow(1 + conservativeAPY / 100, 3/365) - 1;
  const rate3DaysAverage = Math.pow(1 + averageAPY / 100, 3/365) - 1;
  const rate3DaysOptimistic = Math.pow(1 + optimisticAPY / 100, 3/365) - 1;

  const labels = [];
  const conservative = [];
  const average = [];
  const optimistic = [];
  
  let currentDate = new Date();
  let conservativeValue = initialInvestment;
  let averageValue = initialInvestment;
  let optimisticValue = initialInvestment;

  for (let i = 0; i < months * 10; i++) {
    labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    conservativeValue *= (1 + rate3DaysConservative);
    averageValue *= (1 + rate3DaysAverage);
    optimisticValue *= (1 + rate3DaysOptimistic);

    conservative.push(conservativeValue);
    average.push(averageValue);
    optimistic.push(optimisticValue);

    currentDate.setDate(currentDate.getDate() + 3);
  }

  const datasets = [
    {
      label: 'Conservative',
      data: conservative,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointBackgroundColor: '#ef4444',
      borderWidth: 2
    },
    {
      label: 'Average',
      data: average,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointBackgroundColor: '#3b82f6',
      borderWidth: 2
    },
    {
      label: 'Optimistic',
      data: optimistic,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointBackgroundColor: '#22c55e',
      borderWidth: 2
    }
  ];

  return {
    labels,
    datasets,
    conservative,
    average,
    optimistic
  };
}; 