import React, {useEffect} from 'react';
import NodesList from '../components/nodes/NodesList';
import WhitelistRequestForm from '../components/nodes/WhitelistRequestForm';
import { Node, WhitelistRequestFormData } from '../types';
import { ArrowLeft } from 'lucide-react';

interface NodesPageProps {
  nodes: Node[];
  isLoading: boolean;
  selectedNode: Node | null;
  onRequestWhitelist: (node: Node) => void;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
}

const NodesPage: React.FC<NodesPageProps> = ({
  nodes,
  isLoading,
  selectedNode,
  onRequestWhitelist,
  onSubmitRequest,
  onCancelRequest,
}) => {

  useEffect(() => {
    onCancelRequest()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {selectedNode ? (
        <div>
          <button
            onClick={onCancelRequest}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Nodes
          </button>
          <WhitelistRequestForm
            node={selectedNode}
            onSubmit={onSubmitRequest}
            onCancel={onCancelRequest}
          />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default NodesPage;
