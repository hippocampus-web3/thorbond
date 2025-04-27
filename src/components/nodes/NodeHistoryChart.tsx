import React, { useState } from 'react';
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
import { Chart } from 'react-chartjs-2';
import { formatRune } from '../../lib/utils';
import { baseAmount } from '@xchainjs/xchain-util';
import RangeSelector, { RangeOption } from '../ui/RangeSelector';
import { Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

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

interface NodeHistoryChartProps {
  history: any[];
}

const RANGE_OPTIONS: RangeOption[] = [
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
  { label: '3A', value: 1095 },
];

const NodeHistoryChart: React.FC<NodeHistoryChartProps> = ({ history }) => {
  const [range, setRange] = useState(RANGE_OPTIONS[0].value);

  let filtered = history;
  const lastDate = history.length > 0 ? new Date(history[history.length - 1].snapshot.block_timestamp) : null;
  if (lastDate) {
    const minDate = new Date(lastDate);
    minDate.setDate(minDate.getDate() - range);
    filtered = history.filter(row => new Date(row.snapshot.block_timestamp) >= minDate);
    if (filtered.length > 0) {
      const firstDate = new Date(filtered[0].snapshot.block_timestamp);
      let d = new Date(minDate);
      const pointsToAdd = [];
      while (d < firstDate) {
        pointsToAdd.push({
          total_bond: 0,
          earnings: 0,
          snapshot: { block_timestamp: d.toISOString() },
        });
        d.setDate(d.getDate() + 3);
      }
      filtered = [...pointsToAdd, ...filtered];
    }
  }
  const labels = filtered.map((row) => {
    const date = new Date(row.snapshot.block_timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: range > 365 ? '2-digit' : undefined });
  });
  const bondData = filtered.map((row) => Number(row.total_bond));
  const earningsData = filtered.map((row) => Number(row.earnings));

  const data = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Total Bond',
        data: bondData,
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
        data: earningsData,
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null && context.parsed.y !== 0) {
              label += formatRune(baseAmount(context.parsed.y)) + ' RUNE';
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
          callback: function(value: any) { return formatRune(baseAmount(value)); },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Earnings (RUNE)' },
        grid: { display: false },
        ticks: {
          callback: function(value: any) { return formatRune(baseAmount(value)); },
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 sm:mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Bond & Earnings History</h2>
          <Tooltip
            content={
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-gray-700">
                    This chart shows the historical evolution of:
                  </p>
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      • <strong>Total Bond (Blue Line):</strong> The total amount of RUNE bonded to this node at each <a href="https://docs.thorchain.org/frequently-asked-questions/node-operators#what-is-churning-and-how-does-it-affect-my-node" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">churn</a>
                    </p>
                    <p className="text-gray-700">
                      • <strong>Earnings (Green Bars):</strong> The earnings generated by the node between each churn
                    </p>
                  </div>
                  <p className="text-gray-700 mt-2">
                    Each point in the chart represents a churn in the network, showing the state of the node at that specific moment.
                  </p>
                  <p className="text-gray-700 italic">
                    <strong>Note:</strong> A 0 earning indicates that the node was not in active state during that churn and therefore did not generate any earnings.
                  </p>
                </div>
              </div>
            }
          >
            <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </div>
        <RangeSelector
          range={range}
          onRangeChange={setRange}
          options={RANGE_OPTIONS}
        />
      </div>
      <div className="w-full" style={{ height: '18rem', maxHeight: '300px' }}>
        <Chart type='bar' options={options} data={data} />
      </div>
    </div>
  );
};

export default NodeHistoryChart; 