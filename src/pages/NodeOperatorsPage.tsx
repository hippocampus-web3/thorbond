import React, { useState } from 'react';
import NodeOperatorList from '../components/node-operators/NodeOperatorList';
import WhitelistRequestForm from '../components/node-operators/WhitelistRequestForm';
import { NodeOperator } from '../types';

interface NodeOperatorsPageProps {
  nodeOperators: NodeOperator[];
  isAuthenticated: boolean;
  onRequestWhitelist: (nodeOperatorId: string, formData: any) => void;
}

const NodeOperatorsPage: React.FC<NodeOperatorsPageProps> = ({
  nodeOperators,
  isAuthenticated,
  onRequestWhitelist,
}) => {
  const [selectedNodeOperator, setSelectedNodeOperator] = useState<NodeOperator | null>(null);

  const handleRequestWhitelist = (nodeOperatorId: string) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet to request whitelisting.');
      return;
    }
    
    const operator = nodeOperators.find(op => op.id === nodeOperatorId);
    if (operator) {
      setSelectedNodeOperator(operator);
    }
  };

  const handleSubmitRequest = (formData: any) => {
    if (selectedNodeOperator) {
      onRequestWhitelist(selectedNodeOperator.id, formData);
      setSelectedNodeOperator(null);
    }
  };

  const handleCancelRequest = () => {
    setSelectedNodeOperator(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nodes</h1>
        <p className="text-lg text-gray-600">
          Browse available nodes and request whitelisting for RUNE token bonding.
        </p>
      </div>
      {selectedNodeOperator ? (
        <div>
          <button
            onClick={handleCancelRequest}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Node Operators
          </button>
          <WhitelistRequestForm
            nodeOperator={selectedNodeOperator}
            onSubmit={handleSubmitRequest}
            onCancel={handleCancelRequest}
          />
        </div>
      ) : (
        <div>
          <NodeOperatorList
            nodeOperators={nodeOperators}
            onRequestWhitelist={handleRequestWhitelist}
          />
        </div>
      )}
    </div>
  );
};

export default NodeOperatorsPage;
