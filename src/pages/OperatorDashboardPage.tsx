import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import NodeOperatorForm from '../components/nodes/NodeForm';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import NodeOperatorSearch from '../components/nodes/NodeOperatorSearch';
import { Node, NodeOperatorFormData, WhitelistRequest } from '../types';

interface OperatorDashboardPageProps {
  nodes: Node[];
  availableNodes: Node[];
  requests: WhitelistRequest[];
  onCreateListing: (data: NodeOperatorFormData) => void;
  onDeleteListing: () => void;
  onApproveRequest: (requestId: WhitelistRequest) => void;
  onRejectRequest: (requestId: WhitelistRequest) => void;
  onSearchOperator: (address: string) => void;
  isLoading: boolean;
}

const OperatorDashboardPage: React.FC<OperatorDashboardPageProps> = ({
  nodes,
  availableNodes,
  requests,
  onCreateListing,
  onDeleteListing,
  onApproveRequest,
  onRejectRequest,
  onSearchOperator,
  isLoading,
}) => {
  const { isConnected } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('operator') || '');
  const [selectedNode, setSelectedNode] = useState(searchParams.get('node') || '');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchValue) params.operator = searchValue;
    if (selectedNode) params.node = selectedNode;
    setSearchParams(params);
  }, [searchValue, selectedNode, setSearchParams]);

  useEffect(() => {
    const operatorFromUrl = searchParams.get('operator');
    const nodeFromUrl = searchParams.get('node');
    if (operatorFromUrl) {
      onSearchOperator(operatorFromUrl);
    }
    if (nodeFromUrl) {
      setSelectedNode(nodeFromUrl);
    }
    return () => {
      onSearchOperator('');
    }
  }, []);

  const handleSearch = (address: string) => {
    setSearchValue(address);
    onSearchOperator(address);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSelectedNode('');
    onSearchOperator('');
  };

  const handleNodeChange = (nodeAddress: string) => {
    setSelectedNode(nodeAddress);
  };

  const renderSearch = () => (
    <div className="mb-8">
      <NodeOperatorSearch 
        onSearch={handleSearch} 
        onClear={handleClearSearch}
        value={searchValue}
      />
    </div>
  );

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Listing
            </h2>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
          <NodeOperatorForm
            availableNodes={availableNodes}
            onSubmit={onCreateListing}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  if (isConnected && availableNodes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">You are not a Node Operator</h2>
            <Button onClick={() => window.open('https://docs.thorchain.org/thornodes/overview', '_blank')}>
              Learn about becoming a Node Operator
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {!isConnected && renderSearch()}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!isConnected && renderSearch()}
      <OperatorDashboard
        nodes={nodes}
        requests={requests}
        onApproveRequest={onApproveRequest}
        onRejectRequest={onRejectRequest}
        onEditListing={() => setIsEditing(true)}
        onDeleteListing={onDeleteListing}
        selectedNode={selectedNode}
        onNodeChange={handleNodeChange}
      />
    </div>
  );
};

export default OperatorDashboardPage;
