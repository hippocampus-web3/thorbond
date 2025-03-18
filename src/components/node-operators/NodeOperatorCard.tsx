import React from 'react';
import { Clock, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { NodeOperator } from '../../types';
import { formatRune, shortenAddress, getTimeAgo } from '../../lib/utils';

interface NodeOperatorCardProps {
  nodeOperator: NodeOperator;
  onRequestWhitelist: (nodeOperatorId: string) => void;
}

const NodeOperatorCard: React.FC<NodeOperatorCardProps> = ({
  nodeOperator,
  onRequestWhitelist,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">
            Node Operator
          </h3>
          <Badge variant="info">Active</Badge>
        </div>
        
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <User className="h-4 w-4 mr-1" />
          <span>{shortenAddress(nodeOperator.address)}</span>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Bonding Capacity:</span>
            <span className="text-sm font-medium">{formatRune(nodeOperator.bondingCapacity)} RUNE</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Minimum Bond:</span>
            <span className="text-sm font-medium">{formatRune(nodeOperator.minimumBond)} RUNE</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Fee Percentage:</span>
            <span className="text-sm font-medium">{nodeOperator.feePercentage}%</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Instant Churn Amount:</span>
            <span className="text-sm font-medium">{formatRune(nodeOperator.instantChurnAmount)} RUNE</span>
          </div>
        </div>
        
        {nodeOperator.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">{nodeOperator.description}</p>
          </div>
        )}
        
        {nodeOperator.contactInfo && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">{nodeOperator.contactInfo}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 pt-4">
        <div className="w-full flex flex-col space-y-3">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Listed {getTimeAgo(nodeOperator.createdAt)}</span>
          </div>
          
          <Button
            variant="primary"
            fullWidth
            onClick={() => onRequestWhitelist(nodeOperator.id)}
          >
            Request for Whitelist
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NodeOperatorCard;
