import React, { useState } from 'react';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import NodeOperatorForm from '../components/node-operators/NodeOperatorForm';
import Alert from '../components/ui/Alert';
import { NodeOperator, WhitelistRequest } from '../types';

interface OperatorDashboardPageProps {
  nodeOperator: NodeOperator | null;
  requests: WhitelistRequest[];
  isAuthenticated: boolean;
  isNodeOperator: boolean;
  onCreateListing: (formData: any) => void;
  onUpdateListing: (formData: any) => void;
  onDeleteListing: () => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
}

const OperatorDashboardPage: React.FC<OperatorDashboardPageProps> = ({
  nodeOperator,
  requests,
  isAuthenticated,
  isNodeOperator,
  onCreateListing,
  onUpdateListing,
  onDeleteListing,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="warning" title="Authentication Required">
          Please connect your wallet to access the Node Operator Dashboard.
        </Alert>
      </div>
    );
  }

  if (!isNodeOperator && !isEditing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Node Operator</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your node operator listing to publish bonding opportunities for users.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Node Operator Listing
          </button>
        </div>
      </div>
    );
  }

  if (isEditing || !nodeOperator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {nodeOperator ? 'Edit Node Operator Listing' : 'Create Node Operator Listing'}
        </h1>
        <NodeOperatorForm
          initialData={nodeOperator ? {
            address: nodeOperator.address,
            bondingCapacity: nodeOperator.bondingCapacity.toString(),
            minimumBond: nodeOperator.minimumBond.toString(),
            feePercentage: nodeOperator.feePercentage.toString(),
            instantChurnAmount: nodeOperator.instantChurnAmount.toString(),
            description: nodeOperator.description,
            contactInfo: nodeOperator.contactInfo,
          } : undefined}
          onSubmit={(formData) => {
            if (nodeOperator) {
              onUpdateListing(formData);
            } else {
              onCreateListing(formData);
            }
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <OperatorDashboard
        nodeOperator={nodeOperator}
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
