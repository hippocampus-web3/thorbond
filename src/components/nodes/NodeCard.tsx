import React from 'react';
import { Node } from '../../types';
import Button from '../ui/Button';
import { formatRune, shortenAddress, getTimeAgo } from '../../lib/utils';
import { useWallet } from '../../contexts/WalletContext';

interface NodeCardProps {
  node: Node;
  onRequestWhitelist: (node: Node) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  onRequestWhitelist,
}) => {
  const { isConnected, address } = useWallet();
  const isOperator = address === node.operator;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Node</h3>
        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
          Active
        </span>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-sm text-gray-600">
          {shortenAddress(node.address)}
        </span>
      </div>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span className="text-gray-600">Node operator:</span>
          <span className="font-medium">{shortenAddress(node.operator)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bonding Capacity:</span>
          <span className="font-medium">{formatRune(node.bondingCapacity)} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Minimum Bond:</span>
          <span className="font-medium">{formatRune(node.minimumBond)} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Fee Percentage:</span>
          <span className="font-medium">{node.feePercentage}%</span>
        </div>
      </div>

      {node.description && (
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
        Listed {getTimeAgo(node.createdAt)}
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
