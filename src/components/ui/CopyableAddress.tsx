import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableAddressProps {
  address: string;
  label?: string;
  showFull?: boolean;
}

const CopyableAddress: React.FC<CopyableAddressProps> = ({
  address,
  label,
  showFull = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const displayAddress = showFull ? address : `${address.slice(0, 8)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center space-x-2">
      {label && <span className="text-sm text-gray-500">{label}:</span>}
      <span className="font-medium text-gray-900">{displayAddress}</span>
      <button
        onClick={handleCopy}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy address"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default CopyableAddress; 