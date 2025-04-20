import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Copy, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { WhitelistRequest } from '../../types';
import { formatRune, shortenAddress, getNodeExplorerUrl } from '../../lib/utils';
import { baseAmount } from '@xchainjs/xchain-util';
import RequestRow from './RequestRow';

interface RequestListProps {
  requests: WhitelistRequest[];
  actionList?: { 
    title: string, 
    type: 'primary' | 'danger' | 'outline', 
    isDisabled?: (request: WhitelistRequest) => boolean,
    tooltip?: (request: WhitelistRequest) => string | undefined,
    action: (request: WhitelistRequest) => void 
  }[];
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  actionList = [],
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const newTimeRemaining: { [key: string]: string } = {};

      requests.forEach(request => {
        if (request.status === 'pending') {
          const requestTime = new Date(request.timestamp).getTime();
          const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
          const timeLeft = requestTime + threeDaysInMs - now;

          if (timeLeft <= 0) {
            newTimeRemaining[`${request.userAddress}-${request.node.nodeAddress}`] = 'Expired';
          } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            newTimeRemaining[`${request.userAddress}-${request.node.nodeAddress}`] = 
              `${days}d ${hours}h ${minutes}m`;
          }
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000);

    return () => clearInterval(interval);
  }, [requests]);

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Wallet Address
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Node Address
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Intended Bond
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Real Bond
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {actionList.length ? (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            ): null}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <RequestRow
              key={`${request.userAddress}-${request.node.nodeAddress}-${request.timestamp}`}
              request={request}
              actionList={actionList}
              timeRemaining={timeRemaining[`${request.userAddress}-${request.node.nodeAddress}`]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestList;
