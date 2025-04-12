import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useWindowSize } from '../../hooks/useWindowSize';

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
  const { width } = useWindowSize();
  const isMobile = width < 768;

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
      <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '2' : '4'}`}>
        <div className={`space-y-${isMobile ? '2' : '3'}`}>
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
        </div>
        <div className={`flex justify-end space-x-${isMobile ? '2' : '3'}`}>
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
    <div className={`bg-white shadow rounded-lg p-${isMobile ? '4' : '6'}`}>
      <h2 className={`text-${isMobile ? 'xl' : '2xl'} font-bold text-gray-900 mb-${isMobile ? '4' : '6'}`}>Search</h2>
      
      <div className={`bg-gray-50 rounded-lg p-${isMobile ? '3' : '4'} mb-${isMobile ? '4' : '6'}`}>
        <h3 className={`text-${isMobile ? 'base' : 'lg'} font-medium text-gray-900 mb-${isMobile ? '3' : '4'}`}>Search Details</h3>
        {renderContent()}
      </div>
    </div>
  );
};

export default NodeOperatorSearch; 