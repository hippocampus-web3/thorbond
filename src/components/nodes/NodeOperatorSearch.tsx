import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X } from 'lucide-react';

interface NodeOperatorSearchProps {
  onSearch: (address: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  value?: string;
  placeholder?: string;
}

const NodeOperatorSearch: React.FC<NodeOperatorSearchProps> = ({
  onSearch,
  onClear,
  value = '',
  placeholder = 'thor1...',
}) => {
  const [address, setAddress] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim());
    }
  };

  const handleClear = () => {
    setAddress('');
    if (onClear) {
      onClear();
    }
  };

  const renderContent = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Input
              id="operator-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={placeholder}
              label="Address"
              required
              fullWidth
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-8 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!address.trim()}
          >
            Search
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Details</h3>
        {renderContent()}
      </div>
    </div>
  );
};

export default NodeOperatorSearch; 