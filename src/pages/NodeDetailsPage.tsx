import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Node, WhitelistRequestFormData, Message, WhitelistRequest } from '../types';
import { formatRune, shortenAddress, getTimeAgo, getNodeExplorerUrl, formatDuration } from '../lib/utils';
import { useWallet } from '../contexts/WalletContext';
import { baseAmount } from "@xchainjs/xchain-util";
import { ArrowLeft, Eye, Info, Trophy, Sparkles, ExternalLink, Copy, Check } from 'lucide-react';
import WhitelistRequestForm from '../components/nodes/WhitelistRequestForm';
import Tooltip from '../components/ui/Tooltip';
import ChatInterface from '../components/nodes/ChatInterface';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NodeActionTabs from '../components/nodes/NodeActionTabs';
import RuneBondEngine from '../lib/runebondEngine/runebondEngine';
import { BaseAmount } from '@xchainjs/xchain-util';

interface NodeDetailsPageProps {
  nodes: Node[];
  onRequestWhitelist: (node: Node) => void;
  selectedNode: Node | null;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
  messages: Message[];
  onSendMessage: (nodeAddress: string, message: string) => Promise<void>;
  isLoadingMessages?: boolean;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
}

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
}) => {
  const { nodeAddress } = useParams<{ nodeAddress: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [whitelistRequest, setWhitelistRequest] = useState<WhitelistRequest | null>(null);
  const [isLoadingWhitelist, setIsLoadingWhitelist] = useState(false);

  const node = nodes.find(n => n.nodeAddress === nodeAddress);

  useEffect(() => {
    if (!isConnected) {
      setWhitelistRequest(null);
      setIsLoadingWhitelist(false);
    }
  }, [isConnected]);

  useEffect(() => {
    const fetchWhitelistRequest = async () => {
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
    };

    fetchWhitelistRequest();
  }, [isConnected, address, node]);

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

  const isFull = node.maxRune < 0 || node.maxRune < node.minRune;

  const handleSendMessageForNode = (message: string) => {
    if (node?.nodeAddress) {
      onSendMessage(node.nodeAddress, message);
    }
  };

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleBondSubmit = (amount: string) => {
    // TODO: Implement bond submission
  };

  const handleUnbondSubmit = (amount: string) => {
    // TODO: Implement unbond submission
  };

  const renderAddress = (address: string, isNode: boolean = false) => (
    <div className="flex items-center space-x-2">
      {isNode ? (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500">Node Address</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg font-mono font-medium text-gray-900 break-all w-full sm:w-auto">
              <span className="hidden sm:inline">{address}</span>
              <span className="sm:hidden">{shortenAddress(address)}</span>
            </span>
            <button
              onClick={() => window.open(getNodeExplorerUrl(address), '_blank')}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              title="View in explorer"
            >
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleCopy(address)}
              className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              title="Copy address"
            >
              {copiedAddress === address ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-gray-900">
            {shortenAddress(address)}
          </span>
          <button
            onClick={() => window.open(`https://thorchain.net/address/${address}`, '_blank')}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
            title="View in explorer"
          >
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => handleCopy(address)}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
            title="Copy address"
          >
            {copiedAddress === address ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );

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

      {selectedNode && selectedNode.nodeAddress === node.nodeAddress ? (
        <WhitelistRequestForm
          node={selectedNode}
          onSubmit={onSubmitRequest}
          onCancel={onCancelRequest}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Node Details Section */}
          <div className="lg:col-span-3">
            <div className={`shadow rounded-lg p-6 ${
              node.isHidden.hide ? 'bg-yellow-50 border-2 border-yellow-400' : 
              isFull ? 'bg-emerald-50 border-2 border-emerald-400' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Node Details</h1>
                  {(node.isHidden.hide || isFull) && (
                    <div className="flex items-center space-x-1 mt-2">
                      {isFull ? (
                        <>
                          <Trophy className="h-4 w-4 text-emerald-600" />
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600">Full Capacity Node 🎉</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-600">Hidden Node</span>
                        </>
                      )}
                      <Tooltip
                        content={
                          <div className="flex items-start gap-2">
                            <Info className={`h-5 w-5 ${
                              isFull ? 'text-emerald-600' : 'text-yellow-600'
                            } flex-shrink-0 mt-0.5`} />
                            <div>
                              <h3 className="font-medium text-gray-900 mb-2">
                                {isFull ? "Full Capacity Node" : "Hidden Node"}
                              </h3>
                              {isFull ? (
                                <p className="text-sm text-gray-600">
                                  This node has achieved an incredible milestone by reaching its maximum bonding capacity! This is a testament to its reliability and the trust it has earned from the community. Being part of a full capacity node is a prestigious achievement in the THORChain ecosystem! 🚀
                                </p>
                              ) : (
                                <>
                                  {node.isHidden.reasons && node.isHidden.reasons.map((reason, index) => (
                                    <p key={index} className="text-sm text-gray-600 mb-2">
                                      • {reason}
                                    </p>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        }
                      >
                        <Info className={`h-4 w-4 ${
                          isFull ? 'text-emerald-600' : 'text-yellow-600'
                        } cursor-help`} />
                      </Tooltip>
                    </div>
                  )}
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    {renderAddress(node.nodeAddress, true)}
                  </div>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {node.status}
                </span>
              </div>

              {(node.isHidden.hide || isFull) && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  isFull ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h4 className={`text-sm font-medium ${
                    isFull ? 'text-emerald-800' : 'text-yellow-800'
                  } mb-2`}>
                    {isFull ? "🎉 Congratulations! This Node is at Full Capacity" : "What are hidden nodes?"}
                  </h4>
                  <p className={`text-sm ${
                    isFull ? 'text-emerald-700' : 'text-yellow-700'
                  }`}>
                    {isFull 
                      ? "This node has achieved an incredible milestone by reaching its maximum bonding capacity! This is a testament to its reliability and the trust it has earned from the community. Being part of a full capacity node is a prestigious achievement in the THORChain ecosystem! 🚀"
                      : "These are nodes flagged as potentially risky due to unusual behavior or missing information. They're hidden by default to protect users, but you can choose to view and delegate to them at your own risk."}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Operator Address</h3>
                    <div className="mt-1">
                      {renderAddress(node.operatorAddress)}
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
                    <h3 className="text-sm font-medium text-gray-500">Active Time</h3>
                    <p className="mt-1 text-gray-900">{formatDuration(node.activeTime)}</p>
                  </div>
                </div>

                {node.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-900">{node.description}</p>
                  </div>
                )}

                {node.contactInfo && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                    <p className="mt-1 text-gray-900">{node.contactInfo}</p>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Listed {getTimeAgo(node.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action and Chat Section */}
          <div className="lg:col-span-2 space-y-6">
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
            />

            {/* Chat Interface */}
            {isLoadingMessages ? (
              <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-[600px]">
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
      )}
    </div>
  );
};

export default NodeDetailsPage; 