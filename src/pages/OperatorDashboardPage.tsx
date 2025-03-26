import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import Alert from '../components/ui/Alert';
import { NodeOperator, WhitelistRequest } from '../types';
import NodeOperatorForm from '../components/node-operators/NodeOperatorForm';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import Button from '../components/ui/Button';

interface NodeOperatorFormData {
  address: string;
  bondingCapacity: string;
  minimumBond: string;
  feePercentage: string;
  description?: string;
  contactInfo?: string;
}

interface OperatorDashboardPageProps {
  nodeOperator: NodeOperator | null;
  requests: WhitelistRequest[];
  onCreateListing: (data: NodeOperatorFormData) => void;
  onUpdateListing: (data: NodeOperatorFormData) => void;
  onDeleteListing: () => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

const OperatorDashboardPage: React.FC<OperatorDashboardPageProps> = ({
  nodeOperator,
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
              {nodeOperator ? 'Edit Listing' : 'Create New Listing'}
            </h2>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
          <NodeOperatorForm
            initialData={nodeOperator ? {
              address: nodeOperator.address,
              bondingCapacity: nodeOperator.bondingCapacity.toString(),
              minimumBond: nodeOperator.minimumBond.toString(),
              feePercentage: nodeOperator.feePercentage.toString(),
              description: nodeOperator.description,
              contactInfo: nodeOperator.contactInfo,
            } : undefined}
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
        nodeOperator={nodeOperator || {
          id: 'new',
          address: '',
          bondingCapacity: 0,
          minimumBond: 0,
          feePercentage: 0,
          createdAt: new Date()
        }}
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
