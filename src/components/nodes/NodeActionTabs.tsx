import React, { useState } from 'react';
import { Node, WhitelistRequest } from '../../types';
import Button from '../ui/Button';
import { formatRune } from '../../lib/utils';
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util';
import { useWallet } from '../../contexts/WalletContext';
import { Info, ExternalLink } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import { Link } from 'react-router-dom';
import { Node as OfficialNode } from '@xchainjs/xchain-thornode';

interface NodeActionTabsProps {
  node: Node;
  onRequestWhitelist: (node: Node) => void;
  onBondSubmit: (amount: string) => void;
  onUnbondSubmit: (amount: string) => void;
  whitelistRequest: WhitelistRequest | null;
  isLoadingWhitelist: boolean;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
  onRefreshBondAmount: () => void;
  isOperator: boolean;
  officialNode: OfficialNode;
}

const NodeActionTabs: React.FC<NodeActionTabsProps> = ({
  node,
  onRequestWhitelist,
  onBondSubmit,
  onUnbondSubmit,
  whitelistRequest,
  isLoadingWhitelist,
  balance,
  isLoadingBalance,
  onRefreshBondAmount,
  isOperator,
  officialNode
}) => {
  const { isConnected, address } = useWallet();
  const [activeTab, setActiveTab] = useState<'whitelist' | 'bond' | 'unbond'>('whitelist');
  const [bondAmount, setBondAmount] = useState<string>('');
  const [unbondAmount, setUnbondAmount] = useState<string>('');

  const provider = officialNode?.bond_providers?.providers?.find(
    provider => provider.bond_address === address
  );

  const isAlreadyWhitelisted = !!provider;
  const getRealBond = () => provider ? Number(provider.bond) : 0;

  const renderWalletConnectionRequired = () => (
    <div className="space-y-4">
      <Alert variant="info">
        Please connect your wallet to interact with this node.
      </Alert>
    </div>
  );

  const renderTabs = () => (
    <div className="border-b border-gray-200">
      <nav className="flex" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('whitelist')}
          className={`${
            activeTab === 'whitelist'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } flex-1 py-2 px-1 border-b-2 font-medium text-sm text-center`}
        >
          Whitelist Request
        </button>
        <button
          onClick={() => setActiveTab('bond')}
          className={`${
            activeTab === 'bond'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } flex-1 py-2 px-1 border-b-2 font-medium text-sm text-center`}
        >
          Bond
        </button>
        <button
          onClick={() => setActiveTab('unbond')}
          className={`${
            activeTab === 'unbond'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } flex-1 py-2 px-1 border-b-2 font-medium text-sm text-center`}
        >
          Unbond
        </button>
      </nav>
    </div>
  );

  const renderWhitelistTab = () => {
    if (!isConnected) {
      return renderWalletConnectionRequired();
    }

    if (isLoadingWhitelist) {
      return <LoadingSpinner />;
    }

    if (isAlreadyWhitelisted) {
      return (
        <div className="space-y-2 min-h-[140px]">
          <Alert variant="success">
            <div className="space-y-2">
              <p>
                Your whitelist request is approved. You can now bond RUNE to this node.
              </p>
            </div>
          </Alert>
        </div>
      );
    }

    if (whitelistRequest) {
      return (
        <div className="space-y-2 min-h-[140px]">
          {whitelistRequest.status === 'bonded' ? (
            <Alert
              variant="success"
              title="Whitelist Complete! 🎉"
              className="animate-pulse"
            >
              You have successfully bonded with this node. You can now bond additional RUNE at any time.
            </Alert>
          ) : (
            <Alert
              variant={
                whitelistRequest.status === 'pending'
                  ? 'info'
                  : whitelistRequest.status === 'rejected'
                  ? 'error'
                  : 'success'
              }
            >
              <div className="space-y-2">
                <p>
                  Your whitelist request is {whitelistRequest.status.toLowerCase()}. 
                  {whitelistRequest.status === 'pending' 
                    ? ' The node operator will review your request soon.'
                    : whitelistRequest.status === 'rejected'
                    ? ' Please contact the node operator for more information.'
                    : ' You can now bond RUNE to this node.'}
                </p>
                {whitelistRequest.status === 'pending' && (
                  <Link 
                    to="/user-requests" 
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Track your request status in My Requests
                  </Link>
                )}
              </div>
            </Alert>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 min-h-[140px]">
        {isOperator ? (
          <div className="text-center py-2 text-gray-500">
            This is your node. You cannot request whitelist for your own node.
          </div>
        ) : (
          <div className="space-y-2">
            <Alert variant="info">
              The whitelist process allows you to request permission to bond with this node. The node operator will review your request and decide whether to approve it.
            </Alert>
            <Button
              onClick={() => onRequestWhitelist(node)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
              disabled={!isConnected}
            >
              {isConnected ? (
                <span className="flex items-center justify-center space-x-2">
                  <span>Request for Whitelist</span>
                  <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              ) : (
                'Connect Wallet to Request'
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderBondTab = () => {
    if (!isConnected) {
      return renderWalletConnectionRequired();
    }

    if (isLoadingWhitelist) {
      return <LoadingSpinner />;
    }

    if (!whitelistRequest && !isAlreadyWhitelisted) {
      return (
        <div className="space-y-4">
          <Alert variant="warning">
            You need to be whitelisted to bond RUNE to this node.
          </Alert>
        </div>
      );
    }

    const minBondAmount = whitelistRequest?.status === 'bonded' || isAlreadyWhitelisted || 
                         (whitelistRequest?.realBond && Number(whitelistRequest.realBond) >= whitelistRequest.intendedBondAmount) 
                         ? 0 
                         : whitelistRequest?.intendedBondAmount || 0;
    const availableBalance = balance?.amount().toString() || '0';

    return (
      <div className="space-y-4">
        {isLoadingBalance ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="space-y-2">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    Amount to Bond (RUNE)
                    <Tooltip
                      content={
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Bonding Information</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>
                                The minimum bond amount is {formatRune(baseAmount(whitelistRequest?.intendedBondAmount), true)} RUNE, as specified in your whitelist request.
                              </p>
                              <p>
                                After this initial amount, you can delegate as much RUNE as you want. However, it's recommended to consult with the node operator first, as they might suggest distributing larger amounts across different nodes to maximize performance.
                              </p>
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-500" />
                    </Tooltip>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="range"
                    min={minBondAmount}
                    max={availableBalance}
                    value={bondAmount || minBondAmount}
                    onChange={(e) => setBondAmount(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formatRune(baseAmount(bondAmount || minBondAmount), true)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      if (value === '') {
                        setBondAmount(String(minBondAmount));
                      } else {
                        const baseValue = Number(value) * 100000000;
                        setBondAmount(String(Math.min(Math.max(baseValue, minBondAmount), Number(availableBalance))));
                      }
                    }}
                    className="w-full sm:w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="mt-1">
                  <span className="text-sm text-gray-500">Available: {formatRune(balance || baseAmount(0), true)} RUNE</span>
                </div>
              </div>
              <Button
                onClick={() => onBondSubmit(bondAmount)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!isConnected || !bondAmount || Number(bondAmount) <= minBondAmount || Number(bondAmount) >= Number(availableBalance)}
              >
                {isConnected ? 'Confirm Bond' : 'Connect Wallet to Bond'}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderUnbondTab = () => {
    if (!isConnected) {
      return renderWalletConnectionRequired();
    }

    if (isLoadingWhitelist) {
      return <LoadingSpinner />;
    }

    const isUnbondDisabled = node.status === 'Active' || node.status === 'Ready';
    const maxUnbondAmount = getRealBond();

    if (isUnbondDisabled) {
      return (
        <div className="space-y-4">
          <Alert variant="warning">
            Unbonding is not available while the node is {node.status}. The node operator must request a status change first.
          </Alert>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Current bond amount</span>
                <Tooltip
                  content={
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Bond Amount Update</h3>
                        <p className="text-sm text-gray-600">
                          The current bond amount may take a few minutes to update after a transaction. Use the refresh button to check for updates.
                        </p>
                      </div>
                    </div>
                  }
                >
                  <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-500" />
                </Tooltip>
                <button
                  onClick={() => onRefreshBondAmount()}
                  className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Refresh bond amount"
                >
                  <svg
                    className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">{formatRune(baseAmount(maxUnbondAmount))} RUNE</span>
                <a 
                  href={`https://rune.tools/bond?bond_address=${address || ''}&node_address=${node.nodeAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {isLoadingBalance ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="space-y-2">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount to Unbond (RUNE)
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="range"
                    min="0"
                    max={maxUnbondAmount}
                    value={unbondAmount || 0}
                    onChange={(e) => setUnbondAmount(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formatRune(baseAmount(unbondAmount || 0))}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      if (value === '') {
                        setUnbondAmount('0');
                      } else {
                        const baseValue = Number(value) * 100000000;
                        setUnbondAmount(String(Math.min(Math.max(baseValue, 0), maxUnbondAmount)));
                      }
                    }}
                    className="w-full sm:w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="mt-1">
                  <span className="text-sm text-gray-500">Available to Unbond: {formatRune(baseAmount(maxUnbondAmount))} RUNE</span>
                </div>
              </div>
              <Button
                onClick={() => onUnbondSubmit(unbondAmount)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={!isConnected || !unbondAmount || Number(unbondAmount) <= 0}
              >
                {isConnected ? 'Confirm Unbond' : 'Connect Wallet to Unbond'}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {renderTabs()}
      <div className="mt-6 min-h-[145px]">
        {activeTab === 'whitelist' && renderWhitelistTab()}
        {activeTab === 'bond' && renderBondTab()}
        {activeTab === 'unbond' && renderUnbondTab()}
      </div>
    </div>
  );
};

export default NodeActionTabs; 