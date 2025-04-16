import React, { useState } from 'react';
import { Node } from '../../types';
import Button from '../ui/Button';
import { formatRune, shortenAddress, getTimeAgo, formatDuration, getNodeExplorerUrl } from '../../lib/utils';
import { useWallet } from '../../contexts/WalletContext';
import { baseAmount } from "@xchainjs/xchain-util";
import { Copy, Check, Share2, Info, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../ui/Tooltip';
import Alert from '../ui/Alert';

interface NodeCardProps {
  node: Node;
  onRequestWhitelist: (node: Node) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  onRequestWhitelist,
}) => {
  const { isConnected, address } = useWallet();
  const isOperator = address === node.operatorAddress;
  const [copiedNode, setCopiedNode] = useState(false);
  const [copiedOperator, setCopiedOperator] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isVisible, setIsVisible] = useState(!node.isHidden.hide);
  const navigate = useNavigate();

  const handleCopy = async (text: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nodeUrl = `${window.location.origin}/nodes/${node.nodeAddress}`;
    await handleCopy(nodeUrl, setCopiedShare);
  };

  const handleOpenInExplorer = (address: string) => {
    window.open(getNodeExplorerUrl(address), '_blank');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or interactive elements
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/nodes/${node.nodeAddress}`);
  };

  if (node.isHidden.hide && !isVisible) {
    return (
      <div className="bg-white shadow rounded-lg p-4 hover:cursor-pointer" onClick={handleCardClick}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <EyeOff className="h-5 w-5 text-gray-400" />
            <span className="text-gray-500">Hidden Node</span>
          </div>
          <Button
            onClick={() => setIsVisible(true)}
            className="text-sm"
            variant="outline"
          >
            Show Node
          </Button>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">What are hidden nodes?</h4>
          <p className="text-sm text-yellow-700 mb-2">
            These are nodes flagged as potentially risky due to unusual behavior or missing information.
            They're hidden by default to protect users, but you can choose to view and delegate to them at your own risk.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white shadow rounded-lg p-4 hover:cursor-pointer ${node.isHidden.hide ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Node</h3>
          {node.isHidden.hide && (
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Why hidden?</span>
              <Tooltip
                content={
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Hidden Node</h3>
                      {node.isHidden.reasons && node.isHidden.reasons.map((reason, index) => (
                        <p key={index} className="text-sm text-gray-600 mb-2">
                          • {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                }
              >
                <Info className="h-4 w-4 text-yellow-600 cursor-help" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Share node"
          >
            {copiedShare ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
          <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
            {node.status}
          </span>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenInExplorer(node.nodeAddress);
          }}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
          title="View in explorer"
        >
          {shortenAddress(node.nodeAddress)}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(node.nodeAddress, setCopiedNode);
          }}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy node address"
        >
          {copiedNode ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Node operator:</span>
          <div className="flex items-center">
            <span className="font-medium">{shortenAddress(node.operatorAddress)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(node.operatorAddress, setCopiedOperator);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy operator address"
            >
              {copiedOperator ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bonding Capacity:</span>
          <span className="font-medium">{formatRune(baseAmount(node.maxRune))} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Minimum Bond:</span>
          <span className="font-medium">{formatRune(baseAmount(node.minRune))} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bond providers:</span>
          <span className="font-medium">{node.bondProvidersCount} / 100</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Slash points:</span>
          <span className="font-medium">{node.slashPoints}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Fee Percentage:</span>
          <span className="font-medium">{node.feePercentage / 100}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Last status update:</span>
          <span className="font-medium">{formatDuration(node.activeTime)}</span>
        </div>
      </div>

      {node && (
        <p className="mt-4 text-gray-600">
          {node.description}
        </p>
      )}

      {node.contactInfo && (
        <p className="mt-2 text-gray-600">
          {node.contactInfo}
        </p>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Listed {getTimeAgo(node.timestamp)}
      </div>

      {isOperator ? (
        <Button
          disabled
          className="w-full mt-4 text-gray-500 cursor-not-allowed"
        >
          Your Node
        </Button>
      ) : isConnected ? (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onRequestWhitelist(node);
          }}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Request for Whitelist
        </Button>
      ) : (
        <Tooltip
          content={
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">How to request whitelist manually</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You can request whitelist by sending a transaction to the THORChain network with amount 0.1 RUNE and the following MEMO:
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-sm font-mono text-gray-800 break-all">
                    TB:WHT:{node.nodeAddress}:&lt;your_address&gt;:&lt;amount&gt;
                  </code>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium mb-1">Parameters:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><code className="bg-gray-100 px-1 rounded">your_address</code>: Your THORChain address (must start with thor1)</li>
                    <li><code className="bg-gray-100 px-1 rounded">amount</code>: Amount you want to delegate. For example: 1 RUNE = 100000000</li>
                  </ul>
                </div>
              </div>
            </div>
          }
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRequestWhitelist(node);
            }}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!isConnected}
          >
            Connect Wallet to Request
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default NodeCard;
