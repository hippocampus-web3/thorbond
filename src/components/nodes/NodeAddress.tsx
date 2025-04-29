import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { shortenAddress, getNodeExplorerUrl } from '../../lib/utils';

interface NodeAddressProps {
  address: string;
  isNode?: boolean;
}

const NodeAddress: React.FC<NodeAddressProps> = ({ address, isNode = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isNode ? (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500">Node Address</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg font-mono font-medium text-gray-900 break-all w-full sm:w-auto">
              <span className="hidden sm:inline">{address}</span>
              <span className="sm:hidden">{shortenAddress(address)}</span>
            </span>
            <button
              onClick={() => window.open(getNodeExplorerUrl(address), '_blank')}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              title="View in explorer"
            >
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              title="Copy address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-gray-900">{shortenAddress(address)}</span>
          <button
            onClick={() => window.open(`https://thorchain.net/address/${address}`, '_blank')}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
            title="View in explorer"
          >
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
            title="Copy address"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NodeAddress; 