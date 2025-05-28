import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WhitelistRequestFormData } from '../types';
import { formatRune } from '../lib/utils';
import { useWallet } from '../contexts/WalletContext';
import { baseAmount } from "@xchainjs/xchain-util";
import { Info, Trophy, EyeOff, Shield, Lock, Clock, ArrowLeft, Sparkles, Bell } from 'lucide-react';
import WhitelistRequestForm from '../components/nodes/WhitelistRequestForm';
import Tooltip from '../components/ui/Tooltip';
import ChatInterface from '../components/nodes/ChatInterface';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NodeActionTabs from '../components/nodes/NodeActionTabs';
import RuneBondEngine from '../lib/runebondEngine/runebondEngine';
import { BaseAmount } from '@xchainjs/xchain-util';
import { NodesResponse } from '@xchainjs/xchain-thornode';
import NodeHistoryChart from '../components/nodes/NodeHistoryChart';
import axios from 'axios';
import NodeApyChart from '../components/nodes/NodeApyChart';
import NodeAddress from '../components/nodes/NodeAddress';
import NodeRestrictionNotice from '../components/nodes/NodeRestrictionNotice';
import '../lib/chartConfig';
import SubscriptionModal from '../components/subscription/SubscriptionModal';
import { ChatMessageDto, NodeListingDto, WhitelistRequestDto } from '@hippocampus-web3/runebond-client';

interface NodeDetailsPageProps {
  nodes: NodeListingDto[];
  onRequestWhitelist: (node: NodeListingDto) => void;
  selectedNode: NodeListingDto | null;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
  messages: ChatMessageDto[];
  onSendMessage: (nodeAddress: string, message: string) => Promise<void>;
  isLoadingMessages?: boolean;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
  onBondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  onUnbondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  refreshWhitelistFlag: number;
  oficialNodes: NodesResponse;
  onPaymentExecute: (memo: string, amount: number) => Promise<void>;
  onConnectWallet: () => void;
  txSubscriptionHash: string | null;
  onClearTx: () => void;
  hideHeaderButtons?: boolean;
}

const API_HISTORY_URL = 'https://history.runebond.com';

const NodeDetailsPage: React.FC<NodeDetailsPageProps> = ({
  nodes,
  onRequestWhitelist,
  selectedNode,
  onSubmitRequest,
  onCancelRequest,
  messages,
  onSendMessage,
  isLoadingMessages = false,
  balance,
  isLoadingBalance,
  onBondRequest,
  onUnbondRequest,
  refreshWhitelistFlag,
  oficialNodes,
  onPaymentExecute,
  onConnectWallet,
  txSubscriptionHash,
  onClearTx,
  hideHeaderButtons = false
}) => {
  const { nodeAddress: urlNodeAddress } = useParams<{ nodeAddress: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [whitelistRequest, setWhitelistRequest] = useState<WhitelistRequestDto | null>(null);
  const [isLoadingWhitelist, setIsLoadingWhitelist] = useState(false);
  const [nodeHistory, setNodeHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  const getSubdomainNodeAddress = () => {
    const host = window.location.host;
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && !subdomain.includes('deploy-') && subdomain !== 'runebond') {
      return subdomain;
    }
    return null;
  };

  const subdomainNodeAddress = getSubdomainNodeAddress();
  const nodeAddress = subdomainNodeAddress || urlNodeAddress;

  const node = nodes.find(n => n.nodeAddress === nodeAddress);
  const officialNode = oficialNodes.find(n => n.node_address === nodeAddress);

  useEffect(() => {
    if (!isConnected) {
      setWhitelistRequest(null);
      setIsLoadingWhitelist(false);
    }
  }, [isConnected]);

  const fetchWhitelistRequest = useCallback(async () => {
    if (!isConnected || !address || !node) return;

    setIsLoadingWhitelist(true);
    try {
      const { user } = await RuneBondEngine.getInstance().getWhitelistRequests(address, node.nodeAddress);
      setWhitelistRequest(user[0] || null);
    } catch (error) {
      console.error('Failed to fetch whitelist request:', error);
    } finally {
      setIsLoadingWhitelist(false);
    }
  }, [isConnected, address, node]);

  useEffect(() => {
    if (nodeAddress && address) {
      fetchWhitelistRequest();
    }
  }, [nodeAddress, address, refreshWhitelistFlag, fetchWhitelistRequest]);

  useEffect(() => {
    if (!nodeAddress) return;
    setLoadingHistory(true);
    setErrorHistory(null);
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(
          `${API_HISTORY_URL}/rest/v1/node`,
          {
            params: {
              select: 'total_bond,earnings,snapshot(block_timestamp),node_address',
              node_address: `eq.${nodeAddress}`
            }
          }
        );
        data.sort((a: any, b: any) => new Date(a.snapshot.block_timestamp).getTime() - new Date(b.snapshot.block_timestamp).getTime());
        setNodeHistory(data);
      } catch (err: any) {
        setErrorHistory('Error loading data');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [nodeAddress]);

  // Helper to format time to leave
  const formatTimeToLeave = (seconds: number): string => {
    const monthSeconds = 30 * 24 * 3600; // Approximation
    const weekSeconds = 7 * 24 * 3600;
    const daySeconds = 24 * 3600;

    if (seconds <= 0) return "0 weeks";

    let remainingSeconds = seconds;
    const parts: string[] = [];

    // Calculate months
    const months = Math.floor(remainingSeconds / monthSeconds);
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
      remainingSeconds %= monthSeconds;
    }

    // Calculate weeks
    const weeks = Math.floor(remainingSeconds / weekSeconds);
    if (weeks > 0) {
      parts.push(`${weeks} ${weeks === 1 ? 'week' : 'weeks'}`);
      remainingSeconds %= weekSeconds;
    }

    // Calculate days
    const days = Math.floor(remainingSeconds / daySeconds);
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
      remainingSeconds %= daySeconds;
    }

    // If there are any remaining seconds, round up to at least 1 day
    if (remainingSeconds > 0 && days === 0) {
      parts.push("1 day");
    }

    return parts.join(' ') || "0 weeks";
  };

  if (!node) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => {
              navigate('/nodes')
            }}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Nodes
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Loading Skeleton for Node Details */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index}>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="pt-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Skeleton for Action Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-[500px] bg-gray-50 rounded-lg p-4">
                <div className="h-full w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFull = node.maxRune && node.maxRune < 0 || node.maxRune && node.maxRune < node.minRune;

  // Determine the primary state to display
  const getPrimaryState = () => {
    if (node.isHidden && node.isHidden.hide) return 'hidden';
    if (isFull) return 'full';
    if (node.isYieldGuarded && node.isYieldGuarded.hide) return 'yieldGuarded';
    return 'normal';
  };

  const primaryState = getPrimaryState();

  const getStateStyles = () => {
    switch (primaryState) {
      case 'hidden':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-800',
          icon: <EyeOff className="h-5 w-5 text-yellow-600" />,
          title: "Hidden Node",
          description: "These are nodes flagged as potentially risky due to unusual behavior or missing information. They're hidden by default to protect users, but you can choose to view and delegate to them at your own risk."
        };
      case 'full':
        return {
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-400',
          textColor: 'text-emerald-800',
          icon: (
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-emerald-600" />
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
          ),
          title: "Full Capacity Node 🎉",
          description: "This node has achieved an incredible milestone by reaching its maximum bonding capacity! This is a testament to its reliability and the trust it has earned from the community. While it's not currently accepting more liquidity, you can still request whitelist - the node operator may review your request and potentially make space for your delegation. Being part of a full capacity node is a prestigious achievement in the THORChain ecosystem! 🚀"
        };
      case 'yieldGuarded':
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-400',
          textColor: 'text-purple-800',
          icon: (
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <Lock className="h-4 w-4 text-purple-500" />
            </div>
          ),
          title: "Yield Guard Active ⚡",
          description: "The Yield Guard system has identified that delegating RUNE to this node may not generate optimal returns at the current network state. This is a protective measure to help you maximize your earnings. You can still view and delegate to this node, but consider checking other nodes that might offer better yield opportunities at this time."
        };
      default:
        return {
          bgColor: 'bg-white',
          borderColor: '',
          textColor: '',
          icon: null,
          title: "",
          description: ""
        };
    }
  };

  const stateStyles = getStateStyles();

  const handleSendMessageForNode = (message: string) => {
    if (node?.nodeAddress) {
      onSendMessage(node.nodeAddress, message);
    }
  };

  const handleBondSubmit = (amount: string) => {
    if (!node || !address) return;
    onBondRequest(node.nodeAddress, address, Number(amount));
  };

  const handleUnbondSubmit = (amount: string) => {
    if (!node || !address) return;
    onUnbondRequest(node.nodeAddress, address, Number(amount));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!hideHeaderButtons && (
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => {
              navigate('/nodes')
            }}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Nodes
          </button>

          <button
            onClick={() => setIsSubscriptionModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border-2 border-indigo-500 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105"
          >
            <Bell className="h-5 w-5 mr-2 text-indigo-500" />
            Subscribe to Notifications
          </button>
        </div>
      )}

      {selectedNode && selectedNode.nodeAddress === node.nodeAddress && (
        <WhitelistRequestForm
          node={selectedNode}
          onSubmit={onSubmitRequest}
          onCancel={onCancelRequest}
          isOpen={true}
          onClose={onCancelRequest}
        />
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch min-h-[420px]">
          {/* Node Details Section */}
          <div className="lg:col-span-3 h-full flex flex-col">
            <div className={`shadow-md rounded-lg p-4 flex flex-col h-full ${stateStyles.bgColor}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Node Details</h1>
                  {(node.isHidden && node.isHidden.hide || isFull || node.isYieldGuarded && node.isYieldGuarded.hide) && (
                    <NodeRestrictionNotice primaryState={primaryState} stateStyles={stateStyles} node={node} />
                  )}
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <NodeAddress address={node.nodeAddress} isNode={true} />
                  </div>
                  {(node.isHidden && node.isHidden.hide || isFull || node.isYieldGuarded && node.isYieldGuarded.hide) && (
                    <div className={`mt-6 p-4 rounded-lg border ${
                      primaryState === 'full' ? 'bg-emerald-50 border-emerald-200' : 
                      primaryState === 'hidden' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-purple-50 border-purple-200'
                    }`}>
                      <h4 className={`text-sm font-medium ${
                        primaryState === 'full' ? 'text-emerald-800' : 
                        primaryState === 'hidden' ? 'text-yellow-800' :
                        'text-purple-800'
                      } mb-2`}>
                        {stateStyles.title}
                      </h4>
                      <p className={`text-sm ${
                        primaryState === 'full' ? 'text-emerald-700' : 
                        primaryState === 'hidden' ? 'text-yellow-700' :
                        'text-purple-700'
                      }`}>
                        {stateStyles.description}
                      </p>
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {node.status}
                </span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Operator Address</h3>
                    <div className="mt-1">
                      <NodeAddress address={node.operatorAddress} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bonding Capacity</h3>
                    <p className="mt-1 text-gray-900">{formatRune(baseAmount(node.maxRune))} RUNE</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Minimum Bond</h3>
                    <p className="mt-1 text-gray-900">{formatRune(baseAmount(node.minRune))} RUNE</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fee Percentage</h3>
                    <p className="mt-1 text-gray-900">{node.feePercentage / 100}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bond Providers</h3>
                    <p className="mt-1 text-gray-900">{node.bondProvidersCount} / 100</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Slash Points</h3>
                    <p className="mt-1 text-gray-900">{node.slashPoints}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total bond</h3>
                    <p className="mt-1 text-gray-900">{formatRune(baseAmount(node.officialInfo.totalBond))}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Maximum time to leave</h3>
                    {node.maxTimeToLeave > 0 ? (
                      <Tooltip
                        content={
                          <div className="max-w-xs text-sm">
                            <div className="flex items-start gap-2">
                              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">Next Opportunity to unlock RUNE</h4>
                                <p className="text-gray-600 mb-2">
                                  Estimated maximum time before this node could leave the active set, giving you the next opportunity to unlock your bonded RUNE.
                                </p>
                                <p className="text-gray-600 mb-2">
                                  This is a reference value, not a guarantee — actual timing may vary if the node requests to leave, or if older nodes exit voluntarily or are removed by the network.
                                </p>
                                <p className="text-gray-600 mt-1">
                                  This estimate is stable, but currently in beta.
                                </p>
                                <a 
                                  href="https://thorbond.gitbook.io/runebond/maximum-time-to-leave" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                >
                                  Learn more about time to leave
                                </a>
                              </div>
                            </div>
                          </div>
                        }
                        position="bottom"
                      >
                        <div className="flex items-center mt-1 cursor-pointer">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-gray-900">
                            {formatTimeToLeave(node.maxTimeToLeave)}
                          </span>
                          <span className="ml-1 text-xs text-gray-500">(estimate)</span>
                        </div>
                      </Tooltip>
                    ) : (
                      <p className="mt-1 text-gray-900">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* APY Evolution Chart Card */}
            <div className="bg-white shadow-md rounded-lg p-6 mt-6">
              {loadingHistory ? (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingSpinner />
                </div>
              ) : errorHistory ? (
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
                  {errorHistory}
                </div>
              ) : (() => {
                const apyLabels: string[] = [];
                const apyValues: number[] = [];
                const apyDates: string[] = [];
                for (let i = 1; i < nodeHistory.length; i++) {
                  const prev = nodeHistory[i - 1];
                  const curr = nodeHistory[i];
                  const prevDate = new Date(prev.snapshot.block_timestamp);
                  const currDate = new Date(curr.snapshot.block_timestamp);
                  let days = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                  if (days <= 0) days = 3;
                  const bond = Number(prev.total_bond) || 0;
                  const earning = Number(curr.earnings) || 0;
                  if (bond <= 0) continue;
                  const periodsPerYear = 365 / days;
                  const apy = (earning / bond) * periodsPerYear * 100;
                  apyLabels.push(currDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                  apyDates.push(currDate.toISOString());
                  apyValues.push(Number(apy.toFixed(2)));
                }

                if (nodeHistory.length === 1) {
                  const curr = nodeHistory[0];
                  const bond = Number(curr.total_bond) || 0;
                  const earning = Number(curr.earnings) || 0;
                  if (bond > 0) {
                    const periodsPerYear = 365 / 3;
                    const apy = (earning / bond) * periodsPerYear * 100;
                    const currDate = new Date(curr.snapshot.block_timestamp);
                    apyLabels.push(currDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    apyDates.push(currDate.toISOString());
                    apyValues.push(Number(apy.toFixed(2)));
                  }
                }
                return <NodeApyChart 
                  apyLabels={apyLabels} 
                  apyValues={apyValues} 
                  apyDates={apyDates}
                />;
              })()}
            </div>
          </div>

          {/* Action and Chat Section */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <div className="flex flex-col h-full space-y-4">
              {/* Action Tabs */}
              <NodeActionTabs
                node={node}
                onRequestWhitelist={onRequestWhitelist}
                onBondSubmit={handleBondSubmit}
                onUnbondSubmit={handleUnbondSubmit}
                whitelistRequest={whitelistRequest}
                isLoadingWhitelist={isLoadingWhitelist}
                balance={balance}
                isLoadingBalance={isLoadingBalance}
                onRefreshBondAmount={fetchWhitelistRequest}
                isOperator={address === node.operatorAddress}
                officialNode={officialNode}
              />

              {/* Chat Interface */}
              <div className="flex-1 flex flex-col h-full">
                {isLoadingMessages ? (
                  <div className="bg-white shadow-md rounded-lg p-4 flex items-center justify-center h-full min-h-[300px]">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <ChatInterface 
                    messages={messages} 
                    onSendMessage={handleSendMessageForNode} 
                    isDisabled={!isConnected}
                    nodeAddress={node.nodeAddress}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analytics Card - Full Width */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <div className="w-full">
            {loadingHistory ? (
              <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>
            ) : errorHistory ? (
              <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{errorHistory}</div>
            ) : (
              <NodeHistoryChart history={nodeHistory} />
            )}
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        nodeAddress={node.nodeAddress}
        onPaymentExecute={onPaymentExecute}
        onConnectWallet={onConnectWallet}
        txSubscriptionHash={txSubscriptionHash}
        onClearTx={onClearTx}
      />
    </div>
  );
};

export default NodeDetailsPage;