import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import NodeOperatorForm from '../components/nodes/NodeForm';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import { Node, NodeOperatorFormData, WhitelistRequest } from '../types';
interface OperatorDashboardPageProps {
  nodes: Node[];
  requests: WhitelistRequest[];
  onCreateListing: (data: NodeOperatorFormData) => void;
  onDeleteListing: () => void;
  onApproveRequest: (requestId: WhitelistRequest) => void;
  onRejectRequest: (requestId: WhitelistRequest, reason: string) => void;
}

const OperatorDashboardPage: React.FC<OperatorDashboardPageProps> = ({
  nodes,
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
            onSubmit={onCreateListing}
            onCancel={() => setIsEditing(false)}
          />
        </div>
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
