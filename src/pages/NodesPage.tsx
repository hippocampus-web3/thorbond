import React, { useState } from 'react';
import NodesList from '../components/nodes/NodesList';
import WhitelistRequestForm from '../components/nodes/WhitelistRequestForm';
import { Node, WhitelistRequestFormData } from '../types';
import RuneBondEngine from '../lib/runebondEngine/runebondEngine';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';

interface NodesPageProps {
  nodes: Node[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

const NodesPage: React.FC<NodesPageProps> = ({
  nodes,
  isAuthenticated,
  isLoading,
}) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { address } = useWallet();
  const engine = RuneBondEngine.getInstance();

  const handleRequestWhitelist = (node: Node) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet to request whitelisting.');
      return;
    }
    
    const selectedNode = nodes.find(n => n.nodeAddress === node.nodeAddress);
    if (selectedNode) {
      setSelectedNode(selectedNode);
    }
  };

  const handleSubmitRequest = async (formData: WhitelistRequestFormData) => {
    if (!selectedNode || !address) return;

    try {
      await engine.sendWhitelistRequest({
        nodeAddress: selectedNode.nodeAddress,
        userAddress: formData.walletAddress,
        amount: Number(formData.intendedBondAmount)
      });

      toast.success('Whitelist request submitted successfully!');
      setSelectedNode(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting whitelist request';
      toast.error(errorMessage);
    }
  };

  const handleCancelRequest = () => {
    setSelectedNode(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {selectedNode ? (
        <div>
          <button
            onClick={handleCancelRequest}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Node Operators
          </button>
          <WhitelistRequestForm
            node={selectedNode}
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
          <NodesList
            nodes={nodes}
            onRequestWhitelist={handleRequestWhitelist}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default NodesPage;
