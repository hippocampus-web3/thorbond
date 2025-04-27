import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import Dropdown from '../ui/Dropdown';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserBalanceChartProps {
  address?: string;
}

const RANGE_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '15D', value: 15 },
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1A', value: 365 },
];

const API_HISTORY_URL = 'https://history.runebond.com';

const UserBalanceChart: React.FC<UserBalanceChartProps> = ({ address }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [nodeOptions, setNodeOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [range, setRange] = useState(RANGE_OPTIONS[0].value);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_HISTORY_URL}/rest/v1/bond_provider`, {
          params: {
            select: 'block_number,node_address,bond_amount,node!inner(snapshot!inner(block_timestamp))',
            bond_provider_address: `eq.${address}`,
            order: 'block_number.asc',
          },
        });

        const data = response.data;
        if (data && data.length > 0) {
          const nodes = [...new Set(data.map((item: any) => item.node_address))];
          setNodeOptions([
            { label: 'All Nodes', value: 'all' },
            ...nodes.map(node => ({ label: String(node), value: String(node) }))
          ]);

          const processedData = data
            .filter((item: any) => item.node?.snapshot?.block_timestamp)
            .map((item: any) => {
              const timestamp = item.node.snapshot.block_timestamp;
              const date = new Date(timestamp);
              
              if (isNaN(date.getTime())) {
                console.warn('Invalid timestamp:', timestamp);
                return null;
              }

              return {
                block_number: item.block_number,
                date,
                node_address: item.node_address,
                bond_amount: Number((Number(item.bond_amount) / 100_000_000).toFixed(2))
              };
            })
            .filter(Boolean);

          setHistoricalData(processedData);
        }
      } catch (err) {
        console.error('Error fetching bond data:', err);
        setError('Error loading bond data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  let filtered = historicalData;
  if (historicalData.length > 0) {
    if (selectedNode !== 'all') {
      filtered = historicalData.filter(item => item.node_address === selectedNode);
    }

    const groupedByDate = filtered.reduce((acc, item) => {
      try {
        const dateStr = item.date.toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = 0;
        }
        acc[dateStr] = Number((acc[dateStr] + item.bond_amount).toFixed(2));
      } catch (e) {
        console.warn('Error processing date:', item.date, e);
      }
      return acc;
    }, {} as Record<string, number>);

    filtered = Object.entries(groupedByDate)
      .map(([date, bond_amount]) => ({
        date: new Date(date),
        bond_amount
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (filtered.length > 0) {
      const filledData = [...filtered];
      const earliestDate = new Date(filtered[0].date);
      const latestDate = new Date(filtered[filtered.length - 1].date);
      
      let currentDate = new Date(earliestDate);
      while (currentDate > new Date(latestDate.getTime() - (range * 24 * 60 * 60 * 1000))) {
        currentDate.setDate(currentDate.getDate() - 3);
        
        const existingData = filtered.find(item => 
          item.date.getFullYear() === currentDate.getFullYear() &&
          item.date.getMonth() === currentDate.getMonth() &&
          item.date.getDate() === currentDate.getDate()
        );

        if (!existingData) {
          filledData.unshift({
            date: new Date(currentDate),
            bond_amount: 0
          });
        }
      }

      filledData.sort((a, b) => a.date.getTime() - b.date.getTime());
      filtered = filledData;
    }

    if (range > 0) {
      const lastDate = filtered[filtered.length - 1].date;
      const minDate = new Date(lastDate);
      minDate.setDate(minDate.getDate() - range);
      filtered = filtered.filter(item => item.date >= minDate);
    }
  }

  const data = {
    labels: filtered.map(item => 
      item.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: range > 365 ? '2-digit' : undefined 
      })
    ),
    datasets: [
      {
        label: 'Bonded Balance',
        data: filtered.map(item => item.bond_amount),
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          usePointStyle: true
        }
      },
      tooltip: {},
    },
    scales: {
      y: {
        title: { display: true, text: 'Bonded Balance (RUNE)' },
        grid: { display: false },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading bonded balance...</div>;
  }
  if (error) {
    return <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dropdown
          options={nodeOptions}
          value={selectedNode}
          onChange={setSelectedNode}
          placeholder="Select node"
          className="w-64"
        />
        <div className="flex space-x-2">
          {RANGE_OPTIONS.map(option => (
            <button
              key={option.label}
              onClick={() => setRange(option.value)}
              className={`px-3 py-1 rounded-md ${
                range === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full" style={{ height: 300 }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default UserBalanceChart; 