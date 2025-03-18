import React from 'react';
import UserDashboard from '../components/dashboard/UserDashboard';
import Alert from '../components/ui/Alert';
import { WhitelistRequest } from '../types';

interface UserRequestsPageProps {
  requests: WhitelistRequest[];
  isAuthenticated: boolean;
}

const UserRequestsPage: React.FC<UserRequestsPageProps> = ({
  requests,
  isAuthenticated,
}) => {
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="warning" title="Authentication Required">
          Please connect your wallet to view your whitelist requests.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <UserDashboard requests={requests} />
    </div>
  );
};

export default UserRequestsPage;
