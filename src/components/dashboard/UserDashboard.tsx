import React from 'react';
import { Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Tabs from '../ui/Tabs';
import RequestList from '../requests/RequestList';
import { useWallet } from '../../contexts/WalletContext';
import UserBalanceChart from './UserBalanceChart';
import Tooltip from '../ui/Tooltip';
import { WhitelistRequestDto } from '@hippocampus-web3/runebond-client';

interface UserDashboardProps {
  requests: WhitelistRequestDto[];
  searchValue?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  requests, 
  searchValue = ''
}) => {
  const { address: walletAddress } = useWallet();
  const address = searchValue || walletAddress || undefined;

  const filteredRequests = searchValue
    ? requests.filter(request =>
      request.userAddress.toLowerCase().includes(searchValue.toLowerCase())
    )
    : requests;

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const approvedRequests = filteredRequests.filter(req => req.status === 'approved');
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');
  const bondedRequests = filteredRequests.filter(req => req.status === 'bonded');

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No request found for this address</p>
          </div>
        ) : (
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
                <div className="overflow-x-auto">
                  <div className="min-w-max">
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
                          content: <RequestList 
                            requests={approvedRequests} 
                            actionList={[]} 
                          />,
                        },
                        {
                          id: 'rejected',
                          label: `Rejected (${rejectedRequests.length})`,
                          content: <RequestList requests={rejectedRequests} />,
                        },
                        {
                          id: 'bonded',
                          label: `Bonded (${bondedRequests.length})`,
                          content: <RequestList 
                            requests={bondedRequests} 
                            actionList={[]} 
                          />,
                        },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {address && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bonded Balance History</h2>
            <Tooltip
              content={
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      This chart shows the historical bonded balance of your nodes:
                    </p>
                    <div className="space-y-1">
                      <p className="text-gray-700">
                        • <strong>Total Bonded Balance:</strong> The total amount of RUNE bonded across all your nodes
                      </p>
                      <p className="text-gray-700">
                        • <strong>Individual Nodes:</strong> You can filter to see the balance of a specific node
                      </p>
                      <p className="text-gray-700">
                        • <strong>Time Range:</strong> Use the range selector to view different time periods
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      The bonded balance represents your stake in the network and determines your share of rewards.
                    </p>
                  </div>
                </div>
              }
            >
              <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <UserBalanceChart address={address} />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
