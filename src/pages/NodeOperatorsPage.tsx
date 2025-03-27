import React, { useState } from 'react';
import NodeOperatorList from '../components/node-operators/NodeOperatorList';
import WhitelistRequestForm from '../components/node-operators/WhitelistRequestForm';
import { NodeOperator } from '../types';
import ThorBondEngine from '../lib/thorbondEngine';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';

interface WhitelistRequestFormData {
  walletAddress: string;
  intendedBondAmount: string;
}

interface NodeOperatorsPageProps {
  nodeOperators: NodeOperator[];
  isAuthenticated: boolean;
  onRequestWhitelist: (nodeOperatorId: string, formData: WhitelistRequestFormData) => void;
}

const NodeOperatorsPage: React.FC<NodeOperatorsPageProps> = ({
  nodeOperators,
  isAuthenticated,
  onRequestWhitelist,
}) => {
  const [selectedNodeOperator, setSelectedNodeOperator] = useState<NodeOperator | null>(null);
  const { address } = useWallet();
  const engine = ThorBondEngine.getInstance();

  const handleRequestWhitelist = (nodeOperatorId: string) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet to request whitelisting.');
      return;
    }
    
    const operator = nodeOperators.find(op => op.id === nodeOperatorId);
    if (operator) {
      setSelectedNodeOperator(operator);
    }
  };

  const handleSubmitRequest = async (formData: WhitelistRequestFormData) => {
    if (!selectedNodeOperator || !address) return;

    try {
      await engine.sendWhitelistRequest({
        nodeAddress: selectedNodeOperator.address,
        userAddress: formData.walletAddress,
        amount: Number(formData.intendedBondAmount)
      });

      toast.success('Whitelist request submitted successfully!');
      onRequestWhitelist(selectedNodeOperator.id, formData);
      setSelectedNodeOperator(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting whitelist request';
      toast.error(errorMessage);
    }
  };

  const handleCancelRequest = () => {
    setSelectedNodeOperator(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nodes</h1>
            <p className="text-lg text-gray-600">
              Browse available nodes and request whitelisting for RUNE token bonding.
            </p>
          </div>
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
