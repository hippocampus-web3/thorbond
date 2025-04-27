import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import LoadingSpinner from '../ui/LoadingSpinner';
import RangeSelector, { RangeOption } from '../ui/RangeSelector';
import { Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import '../../lib/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const RANGE_OPTIONS: RangeOption[] = [
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
  { label: '3A', value: 1095 },
];

interface NodeApyChartProps {
  apyLabels: string[];
  apyValues: number[];
  apyDates?: string[]; // ISO date strings for each point
  isLoading?: boolean;
}

const NodeApyChart: React.FC<NodeApyChartProps> = ({ apyLabels, apyValues, apyDates, isLoading = false }) => {
  const [range, setRange] = useState(RANGE_OPTIONS[0].value);

  let filteredLabels = apyLabels;
  let filteredValues = apyValues;
  if (apyDates && apyDates.length === apyLabels.length) {
    // Filtrar por fecha real
    const lastDate = new Date(apyDates[apyDates.length - 1]);
    const minDate = new Date(lastDate);
    minDate.setDate(minDate.getDate() - range);
    const allPoints = apyDates
      .map((date, i) => ({
        date: new Date(date),
        label: apyLabels[i],
        value: apyValues[i],
      }));
    const filtered = allPoints.filter(item => item.date >= minDate);
    filteredLabels = filtered.map(item => item.label);
    filteredValues = filtered.map(item => item.value);
    // Solo rellenar con ceros si el primer dato real es el más antiguo disponible
    if (filtered.length > 0) {
      const firstFilteredDate = filtered[0].date.getTime();
      const firstAvailableDate = allPoints[0].date.getTime();
      if (firstFilteredDate === firstAvailableDate) {
        // No hay datos previos, rellenar con ceros si faltan puntos
        let missing = Math.max(0, Math.ceil(range / 3) - filtered.length); // asume 3 días por punto
        const firstDate = new Date(filtered[0].date);
        let d = new Date(firstDate);
        const missingLabels = [];
        const missingValues = [];
        for (let i = 0; i < missing; i++) {
          d.setDate(d.getDate() - 3);
          missingLabels.unshift(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          missingValues.unshift(0);
        }
        filteredLabels = [...missingLabels, ...filteredLabels];
        filteredValues = [...missingValues, ...filteredValues];
      }
    } else if (range > 0) {
      // No datos reales, solo relleno
      let d = new Date(minDate);
      const missingLabels = [];
      const missingValues = [];
      for (let i = 0; i < Math.ceil(range / 3); i++) {
        missingLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        missingValues.push(0);
        d.setDate(d.getDate() + 3);
      }
      filteredLabels = missingLabels;
      filteredValues = missingValues;
    }
  } else if (apyLabels.length > 0 && apyValues.length > 0) {
    // Fallback: últimos N puntos
    const total = apyLabels.length;
    const start = Math.max(0, total - range);
    filteredLabels = apyLabels.slice(start);
    filteredValues = apyValues.slice(start);
    // Rellenar con ceros si faltan puntos
    if (filteredLabels.length < range) {
      const missing = range - filteredLabels.length;
      filteredLabels = [
        ...Array(missing).fill(''),
        ...filteredLabels
      ];
      filteredValues = [
        ...Array(missing).fill(0),
        ...filteredValues
      ];
    }
  }

  const data = {
    labels: filteredLabels,
    datasets: [
      {
        label: 'APY',
        data: filteredValues,
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(2)}% APY`
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'APY (%)' },
        grid: { display: false },
        ticks: {
          callback: (value: any) => `${value}%`
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 sm:mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Historical APY</h2>
          <Tooltip
            content={
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-gray-700">
                    This chart shows the historical APY (Annual Percentage Yield) of the node:
                  </p>
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      • <strong>Churn-based calculation:</strong> Each point in the chart represents a <a href="https://docs.thorchain.org/frequently-asked-questions/node-operators#what-is-churning-and-how-does-it-affect-my-node" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">churn</a>. The APY is calculated using the earnings and bond values from the current churn, and the time elapsed since the previous churn.
                    </p>
                    <p className="text-gray-700">
                      • <strong>Earnings/Bond ratio:</strong> The APY is based on the ratio between the earnings generated and the total bond in the node
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
                  <p className="text-gray-700 italic">
                    <strong>Note:</strong> A 0% APY indicates that the node was not in active state during those churns and therefore did not generate any earnings.
                  </p>
                  <p className="text-gray-600 text-sm italic">
                    APY can vary significantly over time based on node performance and network conditions.
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
      <div className="h-72 sm:h-64 w-full flex items-center justify-center">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default NodeApyChart;