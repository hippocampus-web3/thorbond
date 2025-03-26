import React from 'react';
import { NodeOperator } from '../../types';
import Button from '../ui/Button';
import { formatRune, shortenAddress, getTimeAgo } from '../../lib/utils';

interface NodeOperatorCardProps {
  nodeOperator: NodeOperator;
  onRequestWhitelist: (nodeOperatorId: string) => void;
  isAuthenticated: boolean;
}

const NodeOperatorCard: React.FC<NodeOperatorCardProps> = ({
  nodeOperator,
  onRequestWhitelist,
  isAuthenticated,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Node Operator</h3>
        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
          Active
        </span>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-sm text-gray-600">
          {shortenAddress(nodeOperator.address)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Bonding Capacity:</span>
          <span className="font-medium">{formatRune(nodeOperator.bondingCapacity)} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Minimum Bond:</span>
          <span className="font-medium">{formatRune(nodeOperator.minimumBond)} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Fee Percentage:</span>
          <span className="font-medium">{nodeOperator.feePercentage}%</span>
        </div>
      </div>

      {nodeOperator.description && (
        <p className="mt-4 text-gray-600">
          {nodeOperator.description}
        </p>
      )}

      {nodeOperator.contactInfo && (
        <p className="mt-2 text-gray-600">
          {nodeOperator.contactInfo}
        </p>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Listed {getTimeAgo(nodeOperator.createdAt)}
      </div>

      <Button
        onClick={() => onRequestWhitelist(nodeOperator.id)}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
        disabled={!isAuthenticated}
      >
        {isAuthenticated ? 'Request for Whitelist' : 'Connect Wallet to Request'}
      </Button>
    </div>
  );
};

export default NodeOperatorCard;
