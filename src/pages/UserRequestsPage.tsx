import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserDashboard from '../components/dashboard/UserDashboard';
import { WhitelistRequest } from '../types';
import NodeOperatorSearch from '../components/nodes/NodeOperatorSearch';

interface UserRequestsPageProps {
  requests: WhitelistRequest[];
  onSearchUser: (value: string) => void;
  searchValue: string;
  isConnected: boolean;
  isLoading: boolean;
}

const UserRequestsPage: React.FC<UserRequestsPageProps> = ({
  requests,
  onSearchUser,
  searchValue,
  isConnected,
  isLoading,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchValue, setLocalSearchValue] = React.useState(searchParams.get('user') || '');

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
  }, []);

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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!isConnected && renderSearch()}
      <UserDashboard
        requests={requests}
        searchValue={searchValue}
      />
    </div>
  );
};

export default UserRequestsPage;
