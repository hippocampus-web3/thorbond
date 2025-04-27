import React from 'react';

export interface RangeOption {
  label: string;
  value: number;
}

interface RangeSelectorProps {
  range: number;
  onRangeChange: (value: number) => void;
  options: RangeOption[];
  className?: string;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({ range, onRangeChange, options, className = '' }) => {
  return (
    <div className={`flex justify-between space-x-1 sm:space-x-3 ${className}`}>
      {options.map(option => (
        <button
          key={option.label}
          onClick={() => onRangeChange(option.value)}
          className={`flex-1 px-2 sm:px-4 py-1 text-xs sm:text-sm rounded-md ${
            range === option.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default RangeSelector; 