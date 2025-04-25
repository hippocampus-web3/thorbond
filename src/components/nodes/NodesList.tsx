import React, { useState } from 'react';
import { Search, SlidersHorizontal, Info, Copy, Check } from 'lucide-react';
import NodeCard from './NodeCard';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Tooltip from '../ui/Tooltip';
import { Node } from '../../types';
import { baseAmount, baseToAsset } from '@xchainjs/xchain-util';

const RUNEBOND_ADDRESS = import.meta.env.VITE_RUNEBOND_ADDRESS || "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9";

interface NodeListProps {
  nodes: Node[];
  onRequestWhitelist: (node: Node) => void;
  isLoading?: boolean;
}

// Helper function to determine restriction priority (lower number = higher priority in sorting)
const getNodeRestrictionPriority = (node: Node): number => {
  if (node.isHidden.hide) return 3; // Hidden is the most restrictive, appears last (highest number)
  if (node.maxRune < 0 || node.maxRune < node.minRune) return 2; // Full is next
  if (node.isYieldGuarded.hide) return 1; // Yield guarded is least restrictive, appears first (lowest number)
  return 0; // Should not happen for restricted nodes
};

const NodesList: React.FC<NodeListProps> = ({
  nodes,
  onRequestWhitelist,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('bondingCapacity');
  const [filterMinBond, setFilterMinBond] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(RUNEBOND_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyMemo = () => {
    const memo = "TB:V2:LIST:<node_address>:<min_rune>:<total-bond-target>:<fee_percentage>";
    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const filteredNodes = nodes
    .filter((node) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          node.nodeAddress.toLowerCase().includes(searchLower) ||
          (node.description && node.description.toLowerCase().includes(searchLower)) ||
          (node.contactInfo && node.contactInfo.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter((node) => {
      // Filter by minimum bond
      if (filterMinBond) {
        return baseToAsset(baseAmount(node.minRune, 8)).amount().toNumber() <= parseInt(filterMinBond);
      }
      return true;
    })
    .sort((a, b) => {
      // First, check if nodes have any restrictions
      const aHasRestrictions = a.isYieldGuarded.hide || a.isHidden.hide || (a.maxRune < 0 || a.maxRune < a.minRune);
      const bHasRestrictions = b.isYieldGuarded.hide || b.isHidden.hide || (b.maxRune < 0 || b.maxRune < b.minRune);

      // Nodes without restrictions come first
      if (aHasRestrictions !== bHasRestrictions) {
        return aHasRestrictions ? 1 : -1;
      }

      // If both have restrictions, sort by restriction priority
      if (aHasRestrictions && bHasRestrictions) {
        const priorityA = getNodeRestrictionPriority(a);
        const priorityB = getNodeRestrictionPriority(b);
        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Lower priority number comes first
        }
      }

      // For nodes without restrictions, sort by status
      if (!aHasRestrictions && !bHasRestrictions) {
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        if (a.status === 'Standby' && b.status !== 'Standby') return -1;
        if (a.status !== 'Standby' && b.status === 'Standby') return 1;
      }
      
      // Finally, sort by the selected criteria if priorities are the same
      switch (sortBy) {
        case 'bondingCapacity':
          return b.maxRune - a.maxRune;
        case 'minimumBond':
          return a.minRune - b.minRune;
        case 'feePercentage':
          return a.feePercentage - b.feePercentage;
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        default:
          return 0;
      }
    });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredNodes.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No nodes found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNodes.map((node) => (
          <NodeCard
            key={node.nodeAddress}
            node={node}
            onRequestWhitelist={onRequestWhitelist}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="flex-grow mb-4 md:mb-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search node operators..."
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <SlidersHorizontal className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 mr-2">Filters:</span>
            </div>
            
            <Select
              options={[
                { value: '', label: 'Any Minimum Bond' },
                { value: '5000', label: '≤ 5,000 RUNE' },
                { value: '10000', label: '≤ 10,000 RUNE' },
                { value: '20000', label: '≤ 20,000 RUNE' },
                { value: '50000', label: '≤ 50,000 RUNE' },
              ]}
              value={filterMinBond}
              onChange={setFilterMinBond}
            />
            
            <Select
              options={[
                { value: 'bondingCapacity', label: 'Highest Capacity' },
                { value: 'minimumBond', label: 'Lowest Minimum Bond' },
                { value: 'feePercentage', label: 'Lowest Fee' },
                { value: 'newest', label: 'Newest First' },
              ]}
              value={sortBy}
              onChange={setSortBy}
            />

            <Tooltip
              content={
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">How to list your node</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      To list your node, you can connect your wallet or send a transaction to the THORChain network with amount 0.1 RUNE and the following MEMO:
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-800 break-all">
                          TB:V2:LIST:&lt;node-address&gt;:&lt;min-amount&gt;:&lt;total-bond-target&gt;:&lt;fee-percentage&gt;
                        </code>
                        <button
                          onClick={handleCopyMemo}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedMemo ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 mb-3">
                      <p className="font-medium mb-1">Parameters:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><code className="bg-gray-100 px-1 rounded">node-address</code>: Your node's address (must start with thor1)</li>
                        <li><code className="bg-gray-100 px-1 rounded">min-amount</code>: Minimum bond amount. Must be in base amount. For example: 1 RUNE = 100000000 (must be greater than 0)</li>
                        <li><code className="bg-gray-100 px-1 rounded">total-bond-target</code>: The desired total bond the node operator wants to maintain on the node. This value is used to calculate the node's bond capacity. Must be in base amount. For example: 1 RUNE = 100000000 (must be greater than min-amount)</li>
                        <li><code className="bg-gray-100 px-1 rounded">fee-percentage</code>: Fee percentage (0-100, e.g., 100 for 1%)</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">Send to address:</p>
                      <div className="bg-gray-50 p-2 rounded-md flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-800 break-all">{RUNEBOND_ADDRESS}</code>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedAddress ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              <a 
                href="https://thorbond.gitbook.io/runebond/sections/markdown/list-your-node#list-your-node-manually"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Want to list your node?
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default NodesList;
