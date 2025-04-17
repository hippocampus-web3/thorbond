import React, { useState } from 'react';
import { format } from 'date-fns';
import { Copy, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { WhitelistRequest } from '../../types';
import { formatRune, shortenAddress, getNodeExplorerUrl } from '../../lib/utils';
import { baseAmount } from '@xchainjs/xchain-util';

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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleOpenInExplorer = (address: string, isNode: boolean = false) => {
    if (isNode) {
      window.open(getNodeExplorerUrl(address), '_blank');
    } else {
      window.open(`https://thorchain.net/address/${address}`, '_blank');
    }
  };

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
        return <Badge variant="success" link={`https://rune.tools/bond?bond_address=${request?.userAddress}&node_address=${request?.node?.nodeAddress}`}>Bonded</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const renderAddress = (address: string, isNode: boolean = false) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleOpenInExplorer(address, isNode)}
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
        title="View in explorer"
      >
        {shortenAddress(address)}
      </button>
      <button
        onClick={() => handleCopy(address)}
        className="p-1 hover:bg-gray-100 rounded"
        title="Copy address"
      >
        {copiedAddress === address ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );

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
            <tr key={`${request.userAddress}-${request.node.nodeAddress}-${request.timestamp}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderAddress(request.userAddress)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderAddress(request.node.nodeAddress, true)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRune(baseAmount(request.intendedBondAmount))} RUNE
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRune(baseAmount(request.realBond))} RUNE
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(request.timestamp), 'MMM d, yyyy')}
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
                  {actionList.map((action) => {
                    const isDisabled = action.isDisabled ? action.isDisabled(request) : false;
                    const tooltip = action.tooltip ? action.tooltip(request) : undefined;
                    
                    return (
                      <div key={`${action.title}-${action.type}`} className="inline-block">
                        {isDisabled && tooltip ? (
                          <div className="relative">
                            <Tooltip content={tooltip}>
                              <Button
                                variant={action.type}
                                disabled={isDisabled}
                                size="sm"
                                onClick={() => action.action(request)}
                                className='ml-2'
                              >
                                {action.title}
                              </Button>
                            </Tooltip>
                          </div>
                        ) : (
                          <Button
                            variant={action.type}
                            disabled={isDisabled}
                            size="sm"
                            onClick={() => action.action(request)}
                            className='ml-2'
                          >
                            {action.title}
                          </Button>
                        )}
                      </div>
                    );
                  })}
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
