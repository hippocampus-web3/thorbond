import React from 'react';
import UserDashboard from '../components/dashboard/UserDashboard';
import Alert from '../components/ui/Alert';
import { WhitelistRequest } from '../types';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress } from '../lib/utils';

interface UserRequestsPageProps {
  requests: WhitelistRequest[];
}

const UserRequestsPage: React.FC<UserRequestsPageProps> = ({
  requests,
}) => {
  const { address, isConnected, error } = useWallet();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="warning" title="Authentication Required">
          Please connect your wallet to access the dashboard.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Requests</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Address:</span>
                <span className="text-sm font-medium text-gray-900">
                  {address && shortenAddress(address)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </span>
              </div>
              {error && (
                <Alert variant="error" title="Wallet Error">
                  {error}
                </Alert>
              )}
            </div>
          </div>

          <UserDashboard requests={requests} />
        </div>
      </div>
    </div>
  );
};

export default UserRequestsPage;
