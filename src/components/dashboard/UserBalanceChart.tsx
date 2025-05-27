import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import Dropdown from '../ui/Dropdown';
import RangeSelector from '../ui/RangeSelector';
import '../../lib/chartConfig';

interface UserBalanceChartProps {
  address?: string;
}

interface RunePriceData {
  meta: {
    endRunePriceUSD: string;
    endTime: string;
    startRunePriceUSD: string;
    startTime: string;
  };
  intervals: Array<{
    endTime: string;
    runePriceUSD: string;
    startTime: string;
  }>;
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
const MIDGARD_API_URL = 'https://midgard.ninerealms.com/v2';

const UserBalanceChart: React.FC<UserBalanceChartProps> = ({ address }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [nodeOptions, setNodeOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [range, setRange] = useState(RANGE_OPTIONS[0].value);
  const [runePrices, setRunePrices] = useState<RunePriceData | null>(null);

  useEffect(() => {
    const fetchRunePrices = async () => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const from = now - (range * 24 * 60 * 60);
        const response = await axios.get(`${MIDGARD_API_URL}/history/rune`, {
          params: {
            interval: 'day',
            from,
            to: now
          }
        });
        setRunePrices(response.data);
      } catch (err) {
        console.error('Error fetching rune prices:', err);
      }
    };

    fetchRunePrices();
  }, [range]);

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

  const getRunePriceForDate = (date: Date) => {
    if (!runePrices || !runePrices.intervals.length) return 0;
    
    const timestamp = Math.floor(date.getTime() / 1000);
    
    const closestInterval = runePrices.intervals.reduce((closest, current) => {
      const currentStart = parseInt(current.startTime);
      const currentEnd = parseInt(current.endTime);
      const currentMid = (currentStart + currentEnd) / 2;
      
      const closestStart = parseInt(closest.startTime);
      const closestEnd = parseInt(closest.endTime);
      const closestMid = (closestStart + closestEnd) / 2;
      
      const currentDiff = Math.abs(timestamp - currentMid);
      const closestDiff = Math.abs(timestamp - closestMid);
      
      return currentDiff < closestDiff ? current : closest;
    });

    if (timestamp >= parseInt(closestInterval.startTime) && timestamp <= parseInt(closestInterval.endTime)) {
      return parseFloat(closestInterval.runePriceUSD);
    }
    
    if (timestamp < parseInt(runePrices.intervals[0].startTime)) {
      return parseFloat(runePrices.intervals[0].runePriceUSD);
    }
    
    if (timestamp > parseInt(runePrices.intervals[runePrices.intervals.length - 1].endTime)) {
      return parseFloat(runePrices.intervals[runePrices.intervals.length - 1].runePriceUSD);
    }
    
    const nextInterval = runePrices.intervals.find(interval => 
      parseInt(interval.startTime) > timestamp
    );
    
    if (nextInterval) {
      const prevInterval = runePrices.intervals[runePrices.intervals.indexOf(nextInterval) - 1];
      const prevPrice = parseFloat(prevInterval.runePriceUSD);
      const nextPrice = parseFloat(nextInterval.runePriceUSD);
      const prevTime = parseInt(prevInterval.endTime);
      const nextTime = parseInt(nextInterval.startTime);
      
      const timeRatio = (timestamp - prevTime) / (nextTime - prevTime);
      return prevPrice + (nextPrice - prevPrice) * timeRatio;
    }
    
    return parseFloat(runePrices.intervals[runePrices.intervals.length - 1].runePriceUSD);
  };

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
        label: 'Bonded Balance (RUNE)',
        data: filtered.map(item => item.bond_amount),
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
        label: 'Bonded Balance (USD)',
        data: filtered.map(item => item.bond_amount * getRunePriceForDate(item.date)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointBackgroundColor: '#10b981',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('USD')) {
              return `${label}: $${value.toFixed(2)}`;
            }
            return `${label}: ${value.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Bonded Balance (RUNE)' },
        grid: { display: false },
        ticks: {
          color: '#9ca3af'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Bonded Balance (USD)' },
        grid: { display: false },
        ticks: {
          color: '#9ca3af',
          callback: (value: any) => `$${value}`
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#9ca3af'
        }
      },
    },
  };

  if (loading) {
    return <div className="w-full h-[300px] flex items-center justify-center text-gray-900">Loading bonded balance...</div>;
  }
  if (error) {
    return <div className="w-full h-[300px] flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <Dropdown
          options={nodeOptions}
          value={selectedNode}
          onChange={setSelectedNode}
          placeholder="Select node"
          className="w-full sm:w-64"
        />
        <RangeSelector
          range={range}
          onRangeChange={setRange}
          options={RANGE_OPTIONS}
        />
      </div>
      <div className="w-full" style={{ height: 300 }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default UserBalanceChart; 