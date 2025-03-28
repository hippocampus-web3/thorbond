import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import NodeOperatorForm from '../components/nodes/NodeForm';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import { Node, NodeOperatorFormData, WhitelistRequest } from '../types';

interface OperatorDashboardPageProps {
  nodes: Node[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableNodes: any[]; // TODO: Fix types
  requests: WhitelistRequest[];
  onCreateListing: (data: NodeOperatorFormData) => void;
  onDeleteListing: () => void;
  onApproveRequest: (requestId: WhitelistRequest) => void;
  onRejectRequest: (requestId: WhitelistRequest) => void;
}

const OperatorDashboardPage: React.FC<OperatorDashboardPageProps> = ({
  nodes,
  availableNodes,
  requests,
  onCreateListing,
  onDeleteListing,
  onApproveRequest,
  onRejectRequest,
}) => {
  const { isConnected } = useWallet();
  const [isEditing, setIsEditing] = useState(false);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="warning" title="Authentication Required">
          Please connect your wallet to access the Node Operator Dashboard.
        </Alert>
      </div>
    );
  }

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

  if (availableNodes.length === 0) {
    return (
      <div className="text-center py-12">
        <img 
          src="/thorbond-logo.png" 
          alt="ThorBond Logo" 
          className="w-32 h-32 mx-auto mb-8"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You are not a Node Operator</h2>
        <Button onClick={() => window.open('https://docs.thorchain.org/thornodes/overview', '_blank')}>
          Learn about becoming a Node Operator
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <OperatorDashboard
        nodes={nodes}
        requests={requests}
        onApproveRequest={onApproveRequest}
        onRejectRequest={onRejectRequest}
        onEditListing={() => setIsEditing(true)}
        onDeleteListing={onDeleteListing}
      />
    </div>
  );
};

export default OperatorDashboardPage;
