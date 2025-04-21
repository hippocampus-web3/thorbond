import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Node, WhitelistRequestFormData, Message } from '../types';
import NodeDetailsPage from './NodeDetailsPage';
import { BaseAmount } from '@xchainjs/xchain-util';

interface NodeDetailsPageWrapperProps {
  listedNodes: Node[];
  selectedNodeState: Node | null;
  onRequestWhitelist: (node: Node) => void;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
  messages: Message[];
  onSendMessage: (nodeAddress: string, message: string) => Promise<void>;
  loadChatMessages: (nodeAddr: string) => Promise<void>;
  isLoadingMessages: boolean;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
}

const NodeDetailsPageWrapper: React.FC<NodeDetailsPageWrapperProps> = ({
  listedNodes,
  selectedNodeState,
  onRequestWhitelist,
  onSubmitRequest,
  onCancelRequest,
  messages,
  onSendMessage,
  loadChatMessages,
  isLoadingMessages,
  balance,
  isLoadingBalance,
}) => {
  const { nodeAddress } = useParams<{ nodeAddress: string }>();

  useEffect(() => {
    if (nodeAddress) {
      loadChatMessages(nodeAddress);
    }
  }, [nodeAddress, loadChatMessages]);

  const selectedNodeForForm = listedNodes.find((n: Node) => n.nodeAddress === selectedNodeState?.nodeAddress);

  return (
    <NodeDetailsPage
      nodes={listedNodes}
      selectedNode={selectedNodeForForm ? selectedNodeForForm : null}
      onRequestWhitelist={onRequestWhitelist}
      onSubmitRequest={onSubmitRequest}
      onCancelRequest={onCancelRequest}
      messages={messages}
      onSendMessage={onSendMessage}
      isLoadingMessages={isLoadingMessages}
      balance={balance}
      isLoadingBalance={isLoadingBalance}
    />
  );
};

export default NodeDetailsPageWrapper; 