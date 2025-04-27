import React, { useState, useEffect } from 'react';
import { Line, Bar, Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatRune } from '../../lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PERIOD_OPTIONS = [
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
];

const RANGE_OPTIONS = [
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
  { label: '3A', value: 1095 },
];

const MONTHLY_RETURN = 0.015; // 1.5% monthly return
const ANNUAL_RETURN = 0.20; // 20% annual return
const DEFAULT_INVESTMENT = '5000';

// Mock data for network statistics
const generateMockNetworkData = (months: number) => {
  const baseTotalBond = 1000000;
  const baseEarnings = 50000;
  const baseAPY = 0.20;

  return {
    labels: Array.from({ length: months + 1 }, (_, i) => `${i}M`),
    totalBond: Array.from({ length: months + 1 }, (_, i) => 
      baseTotalBond * (1 + 0.02 * i)
    ),
    earnings: Array.from({ length: months + 1 }, (_, i) => 
      baseEarnings * (1 + 0.01 * i)
    ),
    apy: Array.from({ length: months + 1 }, (_, i) => 
      baseAPY * (1 + 0.005 * i)
    ),
  };
};

const EarningsSimulator: React.FC = () => {
  const [investment, setInvestment] = useState<string>(DEFAULT_INVESTMENT);
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0].value);
  const [showResults, setShowResults] = useState(true);
  const [showAdditionalStats, setShowAdditionalStats] = useState(false);
  const [networkRange, setNetworkRange] = useState(RANGE_OPTIONS[0].value);
  const [apyRange, setApyRange] = useState(RANGE_OPTIONS[0].value);

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInvestment(value);
    setShowResults(!!value);
  };

  const calculateProjectedValue = (initial: number, months: number) => {
    return initial * Math.pow(1 + MONTHLY_RETURN, months);
  };

  const calculateTotalReturn = (initial: number, projected: number) => {
    return ((projected - initial) / initial) * 100;
  };

  const generateChartData = () => {
    const months = period / 30;
    const labels = Array.from({ length: months + 1 }, (_, i) => `${i}M`);
    const data = Array.from({ length: months + 1 }, (_, i) => {
      const investmentNum = parseFloat(investment) || 0;
      return calculateProjectedValue(investmentNum, i);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Projected Growth',
          data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: '#2563eb',
          borderWidth: 2,
        },
      ],
    };
  };

  const generateNetworkChartData = (range: number) => {
    const months = range / 30;
    const mockData = generateMockNetworkData(months);

    return {
      labels: mockData.labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Total Bond',
          data: mockData.totalBond,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: '#2563eb',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          type: 'bar' as const,
          label: 'Earnings',
          data: mockData.earnings,
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
    const months = range / 30;
    const mockData = generateMockNetworkData(months);

    return {
      labels: mockData.labels,
      datasets: [
        {
          label: 'Network APY',
          data: mockData.apy.map(apy => apy * 100),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: '#8b5cf6',
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
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
            return `${context.parsed.y.toFixed(2)} RUNE`;
          }
        }
      },
    },
    scales: {
      y: {
        title: { display: true, text: 'Value (RUNE)' },
        grid: { display: false },
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2);
          }
        }
      },
      x: {
        grid: { display: false },
      },
    },
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
              label += context.parsed.y.toFixed(2) + ' RUNE';
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
            return value.toFixed(2);
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
            return value.toFixed(2);
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
        position: 'top' as const,
        labels: {
          usePointStyle: true
        }
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

  const initialInvestment = parseFloat(investment) || 0;
  const projectedValue = calculateProjectedValue(initialInvestment, period / 30);
  const totalReturn = calculateTotalReturn(initialInvestment, projectedValue);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Calculate your potential
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Estimate your earnings based on your investment and past performance. See what you could achieve!
        </p>
        <p className="text-gray-500">
          Based on historical returns of 20% APY for node operators
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (RUNE)
            </label>
            <input
              type="text"
              value={investment}
              onChange={handleInvestmentChange}
              placeholder="Enter amount in RUNE"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {PERIOD_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showResults && investment && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Initial Investment</p>
              <p className="text-2xl font-bold text-gray-900">{initialInvestment.toFixed(2)} RUNE</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Projected Value</p>
              <p className="text-2xl font-bold text-green-600">
                {projectedValue.toFixed(2)} RUNE
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Estimated Return</p>
              <p className="text-2xl font-bold text-green-600">{totalReturn.toFixed(1)}%</p>
            </div>
          </div>

          <div className="h-64">
            <Line options={chartOptions} data={generateChartData()} />
          </div>

          <div className="mt-4 text-sm text-gray-500 text-center">
            * Projections are based on historical returns of 20% APY. Past performance does not guarantee future results.
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Network Performance</h3>
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
                <Chart type='bar' options={networkChartOptions} data={generateNetworkChartData(networkRange)} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Network APY Evolution</h3>
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