import React, { useState } from 'react';
import { Node } from '../../types';
import Button from '../ui/Button';
import { formatRune, shortenAddress, getTimeAgo, formatDuration } from '../../lib/utils';
import { useWallet } from '../../contexts/WalletContext';
import { baseAmount } from "@xchainjs/xchain-util";
import { Copy, Check } from 'lucide-react';

interface NodeCardProps {
  node: Node;
  onRequestWhitelist: (node: Node) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  onRequestWhitelist,
}) => {
  const { isConnected, address } = useWallet();
  const isOperator = address === node.operatorAddress;
  const [copiedNode, setCopiedNode] = useState(false);
  const [copiedOperator, setCopiedOperator] = useState(false);

  const handleCopy = async (text: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleOpenInExplorer = (address: string) => {
    window.open(`https://thorchain.net/node/${address}`, '_blank');
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Node</h3>
        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
          {node.status}
        </span>
      </div>

      <div className="flex items-center mb-4">
        <button
          onClick={() => handleOpenInExplorer(node.nodeAddress)}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
          title="View in explorer"
        >
          {shortenAddress(node.nodeAddress)}
        </button>
        <button
          onClick={() => handleCopy(node.nodeAddress, setCopiedNode)}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy node address"
        >
          {copiedNode ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Node operator:</span>
          <div className="flex items-center">
            <span className="font-medium">{shortenAddress(node.operatorAddress)}</span>
            <button
              onClick={() => handleCopy(node.operatorAddress, setCopiedOperator)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy operator address"
            >
              {copiedOperator ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bonding Capacity:</span>
          <span className="font-medium">{formatRune(baseAmount(node.maxRune))} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Minimum Bond:</span>
          <span className="font-medium">{formatRune(baseAmount(node.minRune))} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bond providers:</span>
          <span className="font-medium">{node.bondProvidersCount} / 100</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Slash points:</span>
          <span className="font-medium">{node.slashPoints}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Fee Percentage:</span>
          <span className="font-medium">{node.feePercentage / 100}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Last status update:</span>
          <span className="font-medium">{formatDuration(node.activeTime)}</span>
        </div>
      </div>

      {node && (
        <p className="mt-4 text-gray-600">
          {node.description}
        </p>
      )}

      {node.contactInfo && (
        <p className="mt-2 text-gray-600">
          {node.contactInfo}
        </p>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Listed {getTimeAgo(node.timestamp)}
      </div>

      {isOperator ? (
        <Button
          disabled
          className="w-full mt-4 text-gray-500 cursor-not-allowed"
        >
          Your Node
        </Button>
      ) : (
        <Button
          onClick={() => onRequestWhitelist(node)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!isConnected}
        >
          {isConnected ? 'Request for Whitelist' : 'Connect Wallet to Request'}
        </Button>
      )}
    </div>
  );
};

export default NodeCard;
