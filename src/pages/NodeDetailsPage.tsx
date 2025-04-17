import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Node, WhitelistRequestFormData } from '../types';
import Button from '../components/ui/Button';
import { formatRune, shortenAddress, getTimeAgo, getNodeExplorerUrl } from '../lib/utils';
import { useWallet } from '../contexts/WalletContext';
import { baseAmount } from "@xchainjs/xchain-util";
import { ArrowLeft, Eye, Info, Trophy, Sparkles } from 'lucide-react';
import WhitelistRequestForm from '../components/nodes/WhitelistRequestForm';
import Tooltip from '../components/ui/Tooltip';

interface NodeDetailsPageProps {
  nodes: Node[];
  onRequestWhitelist: (node: Node) => void;
  selectedNode: Node | null;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
}

const NodeDetailsPage: React.FC<NodeDetailsPageProps> = ({
  nodes,
  onRequestWhitelist,
  selectedNode,
  onSubmitRequest,
  onCancelRequest,
}) => {
  const { nodeAddress } = useParams<{ nodeAddress: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();

  const node = nodes.find(n => n.nodeAddress === nodeAddress);

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

  const isOperator = address === node.operatorAddress;
  const isFull = node.maxRune < 0 || node.maxRune < node.minRune;

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
                                  This node has achieved an incredible milestone by reaching its maximum bonding capacity! This is a testament to its reliability and the trust it has earned from the community. While it's not currently accepting more liquidity, you can still request whitelist - the node operator may review your request and potentially make space for your delegation. Being part of a full capacity node is a prestigious achievement in the THORChain ecosystem! 🚀
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
                  <button
                    onClick={() => window.open(getNodeExplorerUrl(node.nodeAddress), '_blank')}
                    className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                  >
                    {shortenAddress(node.nodeAddress)}
                  </button>
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
                      ? "This node has achieved an incredible milestone by reaching its maximum bonding capacity! This is a testament to its reliability and the trust it has earned from the community. While it's not currently accepting more liquidity, you can still request whitelist - the node operator may review your request and potentially make space for your delegation. Being part of a full capacity node is a prestigious achievement in the THORChain ecosystem! 🚀"
                      : "These are nodes flagged as potentially risky due to unusual behavior or missing information. They're hidden by default to protect users, but you can choose to view and delegate to them at your own risk."}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Operator Address</h3>
                    <p className="mt-1 text-gray-900">{shortenAddress(node.operatorAddress)}</p>
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
            {/* Whitelist Request Button */}
            <div className="bg-white shadow rounded-lg p-6">
              {isOperator ? (
                <Button
                  disabled
                  className="w-full text-gray-500 cursor-not-allowed"
                >
                  Your Node
                </Button>
              ) : (
                <Button
                  onClick={() => onRequestWhitelist(node)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!isConnected}
                >
                  {isConnected ? 'Request for Whitelist' : 'Connect Wallet to Request'}
                </Button>
              )}
            </div>

            {/* Disabled Chat Interface */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Chat with Operator</h2>
              <div className="space-y-4">
                <div className="h-[500px] bg-gray-50 rounded-lg p-4 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-xl font-medium mb-2">Chat functionality coming soon</div>
                      <p className="text-sm">This feature will allow you to communicate directly with the node operator</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        disabled
                        placeholder="Type a message..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-500 bg-gray-100"
                      />
                      <button
                        disabled
                        className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium whitespace-nowrap"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeDetailsPage; 