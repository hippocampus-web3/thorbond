import React from 'react';
import { format } from 'date-fns';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { WhitelistRequest } from '../../types';
import { formatRune, shortenAddress } from '../../lib/utils';

interface RequestListProps {
  requests: WhitelistRequest[];
  actionList?: { title: string, type: 'primary' | 'danger' | 'outline', isDisabled?: (request: WhitelistRequest) => boolean, action: (request: WhitelistRequest) => void }[];
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  actionList = [],
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No requests found.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string, request?: WhitelistRequest) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'bonded':
        return <Badge variant="success" link={`https://rune.tools/bond?bond_address=${request?.walletAddress}&node_address=${request?.node?.address}`}>Bonded</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

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
          {requests.map((request, index) => (
            <tr key={index}>
              {/* <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {request.discordUsername}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.xUsername} / {request.telegramUsername}
                  </div>
                </div>
              </td> */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shortenAddress(request.walletAddress)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {shortenAddress(request.node.address)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRune(request.intendedBondAmount)} RUNE
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRune(request.realBond)} RUNE
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(request.createdAt, 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(request.status, request)}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-1 text-xs text-gray-500">
                    Reason: {request.rejectionReason}
                  </div>
                )}
              </td>
              {actionList.length ? (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {
                    actionList.map((action) =>
                      <Button
                        key={`${action.title}-${action.type}`}
                        variant={action.type}
                        disabled={action.isDisabled ? action.isDisabled(request) : false}
                        size="sm"
                        onClick={() => action.action(request)}
                      >
                        {action.title}
                      </Button>
                    )
                  }
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestList;
