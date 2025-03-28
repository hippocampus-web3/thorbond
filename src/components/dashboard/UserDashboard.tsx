import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Tabs from '../ui/Tabs';
import RequestList from '../requests/RequestList';
import { WhitelistRequest } from '../../types';
import ThorBondEngine from '../../lib/thorbondEngine';
import { toast } from 'react-toastify';

interface UserDashboardProps {
  requests: WhitelistRequest[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ requests }) => {
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');
  const bondedRequests = requests.filter(req => req.status === 'bonded');
  const engine = ThorBondEngine.getInstance();
  
  const handleBondRequest = async (request: WhitelistRequest) => {
    try {
      await engine.sendBondRequest(request);

      toast.success('Bond request submitted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting bond request';
      toast.error(errorMessage);
    }
  };

  const handleUnbondRequest = async (request: WhitelistRequest) => {
    try {
      await engine.sendUnbondRequest(request);

      toast.success('Unbond request submitted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting unbond request';
      toast.error(errorMessage);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Whitelist Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track the status of your node operator whitelist requests
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{rejectedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Request History</h2>
        </CardHeader>
        <CardContent>
          <Tabs
            tabs={[
              {
                id: 'pending',
                label: `Pending (${pendingRequests.length})`,
                content: <RequestList requests={pendingRequests} />,
              },
              {
                id: 'approved',
                label: `Approved (${approvedRequests.length})`,
                content: <RequestList requests={approvedRequests} actionList={[{title: 'Bond', type: 'primary', action: (request) => handleBondRequest(request)}]} />,
              },
              {
                id: 'rejected',
                label: `Rejected (${rejectedRequests.length})`,
                content: <RequestList requests={rejectedRequests} />,
              },
              {
                id: 'bonded',
                label: `Bonded (${bondedRequests.length})`,
                content: <RequestList requests={bondedRequests} actionList={[{title: 'Unbound', isDisabled: (request) => request.node.status === 'Active' || request.node.status === 'Ready', type: 'outline', action: (request) => handleUnbondRequest(request)}]} />,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
