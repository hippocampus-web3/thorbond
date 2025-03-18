import React from 'react';
import { Users, DollarSign, Percent, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Tabs from '../ui/Tabs';
import StatCard from './StatCard';
import RequestList from '../requests/RequestList';
import Button from '../ui/Button';
import { NodeOperator, WhitelistRequest } from '../../types';
import { formatRune } from '../../lib/utils';

interface OperatorDashboardProps {
  nodeOperator: NodeOperator;
  requests: WhitelistRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onEditListing: () => void;
  onDeleteListing: () => void;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  nodeOperator,
  requests,
  onApproveRequest,
  onRejectRequest,
  onEditListing,
  onDeleteListing,
}) => {
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');
  
  const totalBonded = approvedRequests.reduce((sum, req) => sum + req.intendedBondAmount, 0);
  const remainingCapacity = nodeOperator.bondingCapacity - totalBonded;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Node Operator Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your bonding listings and whitelist requests
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Button variant="outline" onClick={onEditListing}>
            Edit Listing
          </Button>
          <Button variant="danger" onClick={onDeleteListing}>
            Delete Listing
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Available Capacity"
          value={`${formatRune(remainingCapacity)} RUNE`}
          icon={DollarSign}
          description={`${formatRune(totalBonded)} RUNE bonded`}
        />
        <StatCard
          title="Minimum Bond"
          value={`${formatRune(nodeOperator.minimumBond)} RUNE`}
          icon={DollarSign}
        />
        <StatCard
          title="Fee Percentage"
          value={`${nodeOperator.feePercentage}%`}
          icon={Percent}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          icon={Users}
          description={`${approvedRequests.length} approved, ${rejectedRequests.length} rejected`}
        />
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Whitelist Requests</h2>
        </CardHeader>
        <CardContent>
          <Tabs
            tabs={[
              {
                id: 'pending',
                label: `Pending (${pendingRequests.length})`,
                content: (
                  <RequestList
                    requests={pendingRequests}
                    isNodeOperator={true}
                    onApprove={onApproveRequest}
                    onReject={onRejectRequest}
                  />
                ),
              },
              {
                id: 'approved',
                label: `Approved (${approvedRequests.length})`,
                content: (
                  <RequestList
                    requests={approvedRequests}
                    isNodeOperator={true}
                  />
                ),
              },
              {
                id: 'rejected',
                label: `Rejected (${rejectedRequests.length})`,
                content: (
                  <RequestList
                    requests={rejectedRequests}
                    isNodeOperator={true}
                  />
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorDashboard;
