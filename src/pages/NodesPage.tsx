import React from 'react';
import NodesList from '../components/nodes/NodesList';
import { NodeListingDto } from '@hippocampus-web3/runebond-client';

interface NodesPageProps {
  nodes: NodeListingDto[];
  isLoading: boolean;
  onRequestWhitelist: (node: NodeListingDto) => void;
}

const NodesPage: React.FC<NodesPageProps> = ({
  nodes,
  isLoading,
  onRequestWhitelist,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div>
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nodes</h1>
          <p className="text-lg text-gray-600">
            Browse available nodes and request whitelisting for RUNE token bonding.
          </p>
        </div>
        <NodesList
          nodes={nodes}
          onRequestWhitelist={onRequestWhitelist}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default NodesPage;
