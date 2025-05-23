import React, { useState, useEffect } from 'react';
import { Node } from '../../types';
import Button from '../ui/Button';
import { formatRune, shortenAddress, getNodeExplorerUrl } from '../../lib/utils';
import { useWallet } from '../../contexts/WalletContext';
import { baseAmount } from "@xchainjs/xchain-util";
import { Copy, Check, Share2, Info, Eye, EyeOff, Trophy, Sparkles, Shield, Lock, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../ui/Tooltip';
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
  const isFull = node.maxRune < 0 || node.maxRune < node.minRune;
  const [isVisible, setIsVisible] = useState(!node.isHidden.hide && !isFull && !node.isYieldGuarded.hide);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Countdown Timer Logic
  useEffect(() => {
    // Check if maxTimeToLeave is a valid positive number
    if (node.maxTimeToLeave > 0) {
      // Initialize timeLeft with the value from the node
      setTimeLeft(node.maxTimeToLeave);

      const interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          const newTimeLeft = Math.max(0, (prevTimeLeft || 0) - 1);
          if (newTimeLeft <= 0) {
            clearInterval(interval);
          }
          return newTimeLeft;
        });
      }, 1000);

      // Cleanup interval on component unmount or when node changes
      return () => clearInterval(interval);
    } else {
      // If maxTimeToLeave is not positive or not present, set timeLeft to null or 0
      setTimeLeft(node.maxTimeToLeave <= 0 ? 0 : null);
    }
  }, [node.maxTimeToLeave]);

  // Helper to format countdown time
  const formatCountdown = (seconds: number): string => {
    const weekThreshold = 7 * 24 * 3600;
    const monthSeconds = 30 * 24 * 3600; // Approximation
    const weekSeconds = 7 * 24 * 3600;
    const daySeconds = 24 * 3600;

    if (seconds <= 0) return "0w"; // Return 0w if expired

    let remainingSeconds = seconds;
    const parts: string[] = [];

    // Calculate months
    const months = Math.floor(remainingSeconds / monthSeconds);
    if (months > 0) {
      parts.push(`${months}m`);
      remainingSeconds %= monthSeconds;
    }

    // Calculate weeks and remaining days
    let weeks = Math.floor(remainingSeconds / weekSeconds);
    const remainingDaysSeconds = remainingSeconds % weekSeconds;
    const days = Math.floor(remainingDaysSeconds / daySeconds);

    // If there are any days remaining, round up to at least 1 week
    if (days > 0 || remainingDaysSeconds > 0) {
      weeks = Math.max(1, weeks + 1);
    }

    // Add weeks part if > 0 or if it's the only unit
    if (weeks > 0 || parts.length === 0) {
      parts.push(`${weeks}w`);
    }

    return parts.join(' ') || "0w";
  };

  // Determine the primary state to display
  const getPrimaryState = () => {
    if (node.isHidden.hide) return 'hidden';
    if (isFull) return 'full';
    if (node.isYieldGuarded.hide) return 'yieldGuarded';
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
          description: "These are nodes flagged as potentially risky due to unusual behavior or missing information. They're hidden by default to protect users, but you can choose to view and delegate to them at your own risk.",
          buttonVariant: "outline" as const,
          buttonClass: "text-black"
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
          description: "This node has achieved an incredible milestone by reaching its maximum bonding capacity! This is a testament to its reliability and the trust it has earned from the community. While it's not currently accepting more liquidity, you can still request whitelist - the node operator may review your request and potentially make space for your delegation. Being part of a full capacity node is a prestigious achievement in the THORChain ecosystem! 🚀",
          buttonVariant: "primary" as const,
          buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white dark:text-black"
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
          description: "The Yield Guard system has identified that delegating RUNE to this node may not generate optimal returns at the current network state. This is a protective measure to help you maximize your earnings. You can still view and delegate to this node, but consider checking other nodes that might offer better yield opportunities at this time.",
          buttonVariant: "primary" as const,
          buttonClass: "bg-purple-600 hover:bg-purple-700 text-white dark:text-black"
        };
      default:
        return {
          bgColor: 'bg-white',
          borderColor: '',
          textColor: '',
          icon: null,
          title: "",
          description: "",
          buttonVariant: "outline" as const,
          buttonClass: ""
        };
    }
  };

  const stateStyles = getStateStyles();

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

  if ((node.isHidden.hide || isFull || node.isYieldGuarded.hide) && !isVisible) {
    return (
      <div className={`shadow rounded-lg p-4 hover:cursor-pointer min-h-[450px] flex flex-col ${stateStyles.bgColor} border-2 ${stateStyles.borderColor}`} onClick={handleCardClick}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {stateStyles.icon}
            <span className={`font-medium ${stateStyles.textColor}`}>
              {stateStyles.title}
            </span>
          </div>
          <Button
            onClick={() => setIsVisible(true)}
            className={`text-sm ${stateStyles.buttonClass}`}
            variant={stateStyles.buttonVariant}
          >
            Show Node
          </Button>
        </div>
        <div className={`p-4 rounded-lg border ${stateStyles.bgColor} border-${stateStyles.borderColor.replace('border-', '')} flex-grow`}>
          <h4 className={`text-sm font-medium ${stateStyles.textColor} mb-2`}>
            {primaryState === 'hidden' ? "What are hidden nodes?" : stateStyles.title}
          </h4>
          <p className={`text-sm ${stateStyles.textColor.replace('800', '700')}`}>
            {stateStyles.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`shadow rounded-lg p-4 hover:cursor-pointer min-h-[450px] flex flex-col ${stateStyles.bgColor} border-2 ${stateStyles.borderColor}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 flex-wrap">
          <h3 className="text-lg font-medium text-gray-900 mr-2">Node</h3>
          {primaryState === 'hidden' && (
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
          {primaryState === 'full' && (
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-emerald-600">Full Capacity</span>
              <Tooltip
                content={
                  <div className="flex items-start gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Full Capacity Node</h3>
                      <p className="text-sm text-gray-600">
                        This node has reached its maximum bonding capacity. It's a sign of high demand and trust from the community.
                      </p>
                    </div>
                  </div>
                }
              >
                <Info className="h-4 w-4 text-emerald-600 cursor-help" />
              </Tooltip>
            </div>
          )}
          {primaryState === 'yieldGuarded' && (
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-purple-600">Yield Guard</span>
              <Tooltip
                content={
                  <div className="flex items-start gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Yield Guard Active</h3>
                      {node.isYieldGuarded.reasons && node.isYieldGuarded.reasons.map((reason, index) => (
                        <p key={index} className="text-sm text-gray-600 mb-2">
                          • {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                }
              >
                <Info className="h-4 w-4 text-purple-600 cursor-help" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {node.status}
          </span>
          {/* Countdown Timer Section with Tooltip */}
          {timeLeft !== null && node.maxTimeToLeave > 0 && (
            <Tooltip
              content={
                <div className="max-w-xs text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Next Opportunity to Unlock RUNE</h4>
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
              <div 
                className={`text-xs font-medium flex items-center cursor-pointer ${timeLeft <= 0 ? 'text-gray-500' : 'text-gray-700'}`}
              >
                <Clock className={`h-3 w-3 mr-1 ${timeLeft <= 0 ? 'text-gray-400' : 'text-gray-500'}`} />
                <span>{formatCountdown(timeLeft)}</span>
              </div>
            </Tooltip>
          )}
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
            <span className="font-medium text-gray-900">{shortenAddress(node.operatorAddress)}</span>
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
          <span className="font-medium text-gray-900">{formatRune(baseAmount(node.maxRune))} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Minimum Bond:</span>
          <span className="font-medium text-gray-900">{formatRune(baseAmount(node.minRune))} RUNE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bond providers:</span>
          <span className="font-medium text-gray-900">{node.bondProvidersCount} / 100</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Slash points:</span>
          <span className="font-medium text-gray-900">{node.slashPoints}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Fee Percentage:</span>
          <span className="font-medium text-gray-900">{node.feePercentage / 100}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Total bond:</span>
          <span className="font-medium text-gray-900">{formatRune(baseAmount(node.officialInfo.totalBond))}</span>
        </div>
      </div>

      {node.description && (
        <p className="mt-4 text-sm text-gray-600">
          {node.description}
        </p>
      )}

      {node.contactInfo && (
        <p className="mt-2 text-sm text-gray-600">
          {node.contactInfo}
        </p>
      )}

      <div className="mt-auto pt-4">
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
              navigate(`/nodes/${node.nodeAddress}`);
            }}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Bond your RUNE
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default NodeCard;
