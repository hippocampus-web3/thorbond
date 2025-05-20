import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserDashboard from '../components/dashboard/UserDashboard';
import { WhitelistRequest } from '../types';
import NodeOperatorSearch from '../components/nodes/NodeOperatorSearch';
import { Bell } from 'lucide-react';
import SubscriptionModal from '../components/subscription/SubscriptionModal';
import { useWallet } from '../contexts/WalletContext';

interface UserRequestsPageProps {
  requests: WhitelistRequest[];
  onSearchUser: (value: string) => void;
  searchValue: string;
  isConnected: boolean;
  isLoading: boolean;
  onPaymentExecute: (memo: string, amount: number) => Promise<{ txId: string }>;
  onConnectWallet: () => void;
  txSubscriptionHash: string | null;
  onClearTx: () => void;
}

const UserRequestsPage: React.FC<UserRequestsPageProps> = ({
  requests,
  onSearchUser,
  searchValue,
  isConnected,
  isLoading,
  onPaymentExecute,
  onConnectWallet,
  txSubscriptionHash,
  onClearTx
}) => {
  const { address: walletAddress } = useWallet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchValue, setLocalSearchValue] = React.useState(searchParams.get('user') || '');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const hasValidAddress = isConnected ? !!walletAddress : !!(searchValue || localSearchValue);

  useEffect(() => {
    if (localSearchValue) {
      setSearchParams({ user: localSearchValue });
    } else {
      setSearchParams({});
    }
  }, [localSearchValue, setSearchParams]);

  useEffect(() => {
    const userFromUrl = searchParams.get('user');
    if (userFromUrl) {
      onSearchUser(userFromUrl);
    }
    return () => {
      onSearchUser('')
    }
  }, [onSearchUser, searchParams]);

  const handleSearch = (address: string) => {
    setLocalSearchValue(address);
    onSearchUser(address);
  };

  const handleClearSearch = () => {
    setLocalSearchValue('');
    onSearchUser('');
  };

  const renderSearch = () => (
    <div className="mb-8">
      <NodeOperatorSearch 
        onSearch={handleSearch}
        onClear={handleClearSearch}
        value={localSearchValue}
        placeholder="Search by user address..."
        isLoading={isLoading}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsSubscriptionModalOpen(true)}
            disabled={!hasValidAddress}
            className={`inline-flex items-center px-4 py-2 border-2 border-indigo-500 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 ${
              !hasValidAddress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Bell className="h-5 w-5 mr-2 text-indigo-500" />
            Subscribe to Notifications
          </button>
        </div>
        {!isConnected && renderSearch()}
      </div>

      {isLoading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
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
      ) : (
        <UserDashboard
          requests={requests}
          searchValue={searchValue}
        />
      )}

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        nodeAddress={isConnected ? walletAddress || '' : (searchValue || localSearchValue)}
        onPaymentExecute={onPaymentExecute}
        onConnectWallet={onConnectWallet}
        txSubscriptionHash={txSubscriptionHash}
        onClearTx={onClearTx}
      />
    </div>
  );
};

export default UserRequestsPage;
