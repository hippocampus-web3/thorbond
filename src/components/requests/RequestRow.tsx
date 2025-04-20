import React, { useState } from 'react';
import { format } from 'date-fns';
import { Copy, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { WhitelistRequest } from '../../types';
import { formatRune, shortenAddress, getNodeExplorerUrl } from '../../lib/utils';
import { baseAmount } from '@xchainjs/xchain-util';
import { Link } from 'react-router-dom';

interface RequestRowProps {
  request: WhitelistRequest;
  actionList?: { 
    title: string, 
    type: 'primary' | 'danger' | 'outline', 
    isDisabled?: (request: WhitelistRequest) => boolean,
    tooltip?: (request: WhitelistRequest) => string | undefined,
    action: (request: WhitelistRequest) => void 
  }[];
  timeRemaining?: string;
}

const RequestRow: React.FC<RequestRowProps> = ({ request, actionList = [], timeRemaining }) => {
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

  const renderAddress = (address: string, isNode: boolean = false) => (
    <div className="flex items-center space-x-2">
      {isNode ? (
        <Link
          to={`/nodes/${address}`}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
          title="View node details"
        >
          {shortenAddress(address)}
        </Link>
      ) : (
        <button
          onClick={() => handleOpenInExplorer(address, isNode)}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
          title="View in explorer"
        >
          {shortenAddress(address)}
        </button>
      )}
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

  const getStatusBadge = () => {
    switch (request.status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'bonded':
        return <Badge variant="success" link={`https://rune.tools/bond?bond_address=${request.userAddress}&node_address=${request.node.nodeAddress}`}>Bonded</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant="warning">Pending</Badge>
              {timeRemaining && (
                <Tooltip content="If the transaction is not completed within this time, the request will be automatically rejected">
                  <div className="flex items-center text-xs">
                    <div className="flex items-center px-2 py-1 rounded-md bg-gray-100">
                      <span className="text-gray-600 font-medium">
                        {timeRemaining === 'Expired' ? (
                          <span className="text-red-500 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                            Expired
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                            {timeRemaining}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        );
    }
  };

  return (
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
        {getStatusBadge()}
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
  );
};

export default RequestRow; 