import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opción',
  label,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textRef.current) {
      const isTruncated = textRef.current.scrollWidth > textRef.current.clientWidth;
      setShowTooltip(isTruncated);
    }
  }, [value]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative w-full sm:w-[400px] ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={`
          relative w-full rounded-md border shadow-sm
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2 min-w-0">
            {selectedOption?.icon && (
              <span className="text-gray-500 flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span 
              ref={textRef}
              className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'} truncate`}
              title={showTooltip ? selectedOption?.label || placeholder : undefined}
            >
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`
                  flex items-center px-3 py-2 cursor-pointer
                  hover:bg-gray-100
                  ${option.value === value ? 'bg-blue-50' : ''}
                `}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.icon && (
                  <span className="text-gray-500 flex-shrink-0 mr-2">{option.icon}</span>
                )}
                <span className="text-gray-900 truncate" title={option.label}>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown; 