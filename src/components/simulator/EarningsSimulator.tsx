import React, { useState, useEffect } from 'react';
import { Line, Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatRune } from '../../lib/utils';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { baseAmount } from '@xchainjs/xchain-util';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner';
import { calculateProjections } from '../../lib/projectionCalculator';
import TooltipComponent from '../ui/Tooltip';
import { generateAPYData } from '../../lib/apyCalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const RANGE_OPTIONS = [
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
  { label: '3A', value: 1095 },
];

const DEFAULT_INVESTMENT = '5000';

const API_HISTORY_URL = 'https://history.runebond.com';

const EarningsSimulator: React.FC = () => {
  const [investment, setInvestment] = useState<string>(DEFAULT_INVESTMENT);
  const [showResults, setShowResults] = useState(true);
  const [showAdditionalStats, setShowAdditionalStats] = useState(false);
  const [networkRange, setNetworkRange] = useState(RANGE_OPTIONS[0].value);
  const [apyRange, setApyRange] = useState(RANGE_OPTIONS[0].value);
  const [projectionRange, setProjectionRange] = useState(RANGE_OPTIONS[0].value);
  const [networkData, setNetworkData] = useState<any[]>([]);
  const [loadingNetworkData, setLoadingNetworkData] = useState(true);
  const [errorNetworkData, setErrorNetworkData] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoadingNetworkData(true);
        const response = await axios.get(`${API_HISTORY_URL}/rest/v1/snapshot`, {
          params: {
            select: 'block_number,block_timestamp,total_active_bond,total_earnings',
            order: 'block_number.asc',
          }
        });
        setNetworkData(response.data);
      } catch (err) {
        console.error('Error fetching network data:', err);
        setErrorNetworkData('Error loading network data');
      } finally {
        setLoadingNetworkData(false);
      }
    };

    fetchNetworkData();
  }, []);

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(value);
    if (isNaN(numericValue) || numericValue <= 3000000) {
      setInvestment(value);
    }
  };

  const handleInvestmentBlur = () => {
    setIsEditing(false);
    if (!investment) {
      setInvestment(DEFAULT_INVESTMENT);
    } else {
      const numericValue = parseInt(investment);
      if (numericValue > 3000000) {
        setInvestment('3000000');
      }
    }
  };
  const generateProjectionChartData = () => {
    // Extraer los APYs históricos del networkData usando una ventana móvil de 7 días
    const historicalAPYs = networkData.map((row, index) => {
      const currentDate = new Date(row.block_timestamp);
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Encontrar el punto más cercano a 7 días atrás
      let startIndex = index;
      while (startIndex > 0 && new Date(networkData[startIndex - 1].block_timestamp) >= sevenDaysAgo) {
        startIndex--;
      }

      if (startIndex === index) {
        // Si no hay datos anteriores, intentar usar el siguiente punto
        if (index < networkData.length - 1) {
          const nextRow = networkData[index + 1];
          const days = (new Date(nextRow.block_timestamp).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
          const bond = Number(row.total_active_bond) / 100_000_000;
          const earnings = Number(nextRow.total_earnings) / 100_000_000;
          if (bond <= 0) return 0;
          const periodsPerYear = 365 / days;
          return (earnings / bond) * periodsPerYear * 100;
        }
        return 0;
      }

      const startRow = networkData[startIndex];
      const days = (currentDate.getTime() - new Date(startRow.block_timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const bond = Number(startRow.total_active_bond) / 100_000_000;
      const earnings = Number(row.total_earnings) / 100_000_000;
      if (bond <= 0) return 0;
      const periodsPerYear = 365 / days;
      return (earnings / bond) * periodsPerYear * 100;
    }).filter(apy => apy > 0);

    // Calcular las proyecciones usando la nueva lógica
    return calculateProjections(
      historicalAPYs,
      parseFloat(investment) || 1000,
      projectionRange / 30 // convertir días a meses
    );
  };

  const projectionData = generateProjectionChartData();
  const initialInvestment = parseFloat(investment) || 0;

  const getProjectedValue = (values: number[]) => {
    return values.length > 0 ? values[values.length - 1] : 0;
  };

  const getReturnPercentage = (projectedValue: number) => {
    return initialInvestment > 0 ? ((projectedValue / initialInvestment - 1) * 100) : 0;
  };

  const getAPY = (values: number[]) => {
    if (values.length === 0 || !projectionRange) return 0;
    const finalValue = values[values.length - 1];
    const years = projectionRange / 365;
    return ((Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100);
  };

  const projectionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatRune(baseAmount(context.parsed.y * 100_000_000))}`;
          }
        }
      },
    },
    scales: {
      y: {
        title: { display: true, text: 'Value (RUNE)' },
        grid: { display: false },
        beginAtZero: false,
        min: initialInvestment * 0.98,
        ticks: {
          callback: function(value: any) {
            const runeValue = value * 100_000_000;
            return formatRune(baseAmount(runeValue));
          }
        }
      },
      x: {
        display: false,
        grid: { display: false },
        ticks: {
          display: false
        }
      },
    },
    elements: {
      point: {
        radius: 0
      },
      line: {
        tension: 0.3
      }
    }
  };

  const generateNetworkChartData = (range: number) => {
    let filtered = networkData;
    if (networkData.length > 0) {
      const lastDate = new Date(networkData[networkData.length - 1].block_timestamp);
      const minDate = new Date(lastDate);
      minDate.setDate(minDate.getDate() - range);
      filtered = networkData.filter(row => new Date(row.block_timestamp) >= minDate);
    }

    const labels = filtered.map((row) => {
      const date = new Date(row.block_timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: range > 365 ? '2-digit' : undefined 
      });
    });

    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Total Bond',
          data: filtered.map(row => Number(row.total_active_bond) / 100_000_000),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: '#2563eb',
          yAxisID: 'y',
          borderWidth: 2,
        },
        {
          type: 'bar' as const,
          label: 'Earnings',
          data: filtered.map(row => Number(row.total_earnings) / 100_000_000),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const generateAPYChartData = (range: number) => {
    const { labels, datasets } = generateAPYData(networkData, range);
    
    return {
      labels,
      datasets: [
        {
          ...datasets[0],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: '#8b5cf6',
          borderWidth: 2
        }
      ]
    };
  };

  const networkChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatRune(baseAmount(context.parsed.y * 100_000_000));
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Total Bond (RUNE)' },
        grid: { display: false },
        ticks: {
          callback: function(value: any) {
            return formatRune(baseAmount(value * 100_000_000));
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Earnings (RUNE)' },
        grid: { display: false },
        ticks: {
          callback: function(value: any) {
            return formatRune(baseAmount(value * 100_000_000));
          }
        }
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const apyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toFixed(2)}%`;
          }
        }
      },
    },
    scales: {
      y: {
        title: { display: true, text: 'APY (%)' },
        grid: { display: false },
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2) + '%';
          }
        }
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Project your potential earnings
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Use historical returns to estimate how your investment could grow over time.
        </p>
      </div>

      {showResults && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Initial Investment</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={investment}
                    onChange={handleInvestmentChange}
                    onBlur={handleInvestmentBlur}
                    className="w-full text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="w-full text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1 cursor-pointer hover:border-blue-500 hover:ring-1 hover:ring-blue-500"
                    onClick={() => setIsEditing(true)}
                  >
                    {parseInt(investment)} RUNE
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Conservative</p>
                  <p className="text-xl font-bold text-red-600">
                    {getProjectedValue(projectionData.conservative).toFixed(2)} RUNE
                  </p>
                  <p className="text-sm text-gray-500">
                    {getReturnPercentage(getProjectedValue(projectionData.conservative)).toFixed(1)}% Return
                  </p>
                  <p className="text-xs text-gray-400">
                    {getAPY(projectionData.conservative).toFixed(1)}% APY
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-xl font-bold text-blue-600">
                    {getProjectedValue(projectionData.average).toFixed(2)} RUNE
                  </p>
                  <p className="text-sm text-gray-500">
                    {getReturnPercentage(getProjectedValue(projectionData.average)).toFixed(1)}% Return
                  </p>
                  <p className="text-xs text-gray-400">
                    {getAPY(projectionData.average).toFixed(1)}% APY
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Optimistic</p>
                  <p className="text-xl font-bold text-green-600">
                    {getProjectedValue(projectionData.optimistic).toFixed(2)} RUNE
                  </p>
                  <p className="text-sm text-gray-500">
                    {getReturnPercentage(getProjectedValue(projectionData.optimistic)).toFixed(1)}% Return
                  </p>
                  <p className="text-xs text-gray-400">
                    {getAPY(projectionData.optimistic).toFixed(1)}% APY
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="flex items-center gap-2">
                  <TooltipComponent
                    content={
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-gray-700">This chart shows three potential scenarios for your investment:</p>
                          <div className="space-y-1">
                            <p className="text-gray-700">
                              • <strong>Conservative (Red):</strong> Lower-end projection based on historical APY minus standard deviation
                            </p>
                            <p className="text-gray-700">
                              • <strong>Average (Blue):</strong> Projection based on historical average APY
                            </p>
                            <p className="text-gray-700">
                              • <strong>Optimistic (Green):</strong> Higher-end projection based on historical APY plus standard deviation
                            </p>
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-gray-700"><strong>How the standard deviation is calculated:</strong></p>
                            <ol className="list-decimal list-inside text-gray-600 space-y-1">
                              <li>Calculate the average (mean) of historical APYs</li>
                              <li>Calculate the variance by finding the average of the squared differences from the mean</li>
                              <li>Take the square root of the variance to get the standard deviation</li>
                            </ol>
                            <p className="text-gray-700 mt-2">
                              The projections are calculated using historical APY data from each <a href="https://docs.thorchain.org/frequently-asked-questions/node-operators#what-is-churning-and-how-does-it-affect-my-node" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">churn</a> and assume compound interest every 3 days.
                            </p>
                          </div>
                          <p className="text-gray-600 text-sm italic">
                            Note: Past performance does not guarantee future results. These projections are estimates based on historical data.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipComponent>
                </div>
                <div className="flex space-x-2">
                  {RANGE_OPTIONS.map(option => (
                    <TooltipComponent
                      key={option.label}
                      content={
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            {option.label === '1M' && '1 Month projection'}
                            {option.label === '3M' && '3 Months projection'}
                            {option.label === '6M' && '6 Months projection'}
                            {option.label === '1A' && '1 Year projection'}
                            {option.label === '3A' && '3 Years projection'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Shows how your investment could grow over this period based on historical APY data.
                          </p>
                        </div>
                      }
                    >
                      <button
                        onClick={() => setProjectionRange(option.value)}
                        className={`px-3 py-1 rounded-md ${
                          projectionRange === option.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    </TooltipComponent>
                  ))}
                </div>
              </div>

              <div className="h-[400px]">
                <Line options={projectionChartOptions} data={generateProjectionChartData()} />
              </div>

              <div className="text-sm text-gray-500 text-center">
                * Projections are based on historical APY data and assume compound interest every 3 days. Past performance does not guarantee future results.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => setShowAdditionalStats(!showAdditionalStats)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
        >
          {showAdditionalStats ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Hide Network Statistics
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Show Network Statistics
            </>
          )}
        </button>

        {showAdditionalStats && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Bond & Earnings</h3>
                  <TooltipComponent
                    content={
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            This chart shows the historical evolution of:
                          </p>
                          <div className="space-y-1">
                            <p className="text-gray-700">
                              • <strong>Total Bond (Blue Line):</strong> The total amount of RUNE bonded in the network at each <a href="https://docs.thorchain.org/frequently-asked-questions/node-operators#what-is-churning-and-how-does-it-affect-my-node" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">churn</a>
                            </p>
                            <p className="text-gray-700">
                              • <strong>Earnings (Green Bars):</strong> The earnings generated by the network between each churn
                            </p>
                          </div>
                          <p className="text-gray-700 mt-2">
                            Each point in the chart represents a churn in the network, showing the state of the network at that specific moment.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipComponent>
                </div>
                <div className="flex space-x-2">
                  {RANGE_OPTIONS.map(option => (
                    <button
                      key={option.label}
                      onClick={() => setNetworkRange(option.value)}
                      className={`px-3 py-1 rounded-md ${
                        networkRange === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                {loadingNetworkData ? (
                  <div className="h-full flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : errorNetworkData ? (
                  <div className="h-full flex items-center justify-center text-red-500">
                    {errorNetworkData}
                  </div>
                ) : (
                  <Chart type='bar' options={networkChartOptions} data={generateNetworkChartData(networkRange)} />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Historical APY</h3>
                  <TooltipComponent
                    content={
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-gray-700">This chart shows the historical APY (Annual Percentage Yield) of the network:</p>
                          <div className="space-y-1">
                            <p className="text-gray-700">
                              • <strong>Churn-based calculation:</strong> Each point in the chart represents a <a href="https://docs.thorchain.org/frequently-asked-questions/node-operators#what-is-churning-and-how-does-it-affect-my-node" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">churn</a>. The APY is calculated using the earnings and bond values from the current churn, and the time elapsed since the previous churn.
                            </p>
                            <p className="text-gray-700">
                              • <strong>Earnings/Bond ratio:</strong> The APY is based on the ratio between the earnings generated and the total bond in the network
                            </p>
                            <p className="text-gray-700">
                              • <strong>Annualized return:</strong> The result is annualized to show the expected yearly return
                            </p>
                          </div>
                          <p className="text-gray-700 mt-2">
                            The APY is calculated as: (Earnings / Total Bond) * (365 / Days) * 100
                          </p>
                          <p className="text-gray-700">
                            Where Days is the time elapsed since the previous churn.
                          </p>
                          <p className="text-gray-600 text-sm italic">
                            Note: APY can vary significantly over time based on network performance and market conditions.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipComponent>
                </div>
                <div className="flex space-x-2">
                  {RANGE_OPTIONS.map(option => (
                    <button
                      key={option.label}
                      onClick={() => setApyRange(option.value)}
                      className={`px-3 py-1 rounded-md ${
                        apyRange === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <Line options={apyChartOptions} data={generateAPYChartData(apyRange)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsSimulator; 