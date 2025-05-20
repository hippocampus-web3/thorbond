import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Node, WhitelistRequestFormData, Message } from '../types';
import NodeDetailsPage from './NodeDetailsPage';
import { BaseAmount } from '@xchainjs/xchain-util';
import { NodesResponse } from '@xchainjs/xchain-thornode';

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
  onBondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  onUnbondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  refreshWhitelistFlag: number;
  oficialNodes: NodesResponse;
  onPaymentExecute: (memo: string, amount: number) => Promise<{ txId: string }>;
  onConnectWallet: () => void;
  txSubscriptionHash: string | null;
  onClearTx: () => void;
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
  onBondRequest,
  onUnbondRequest,
  refreshWhitelistFlag,
  oficialNodes,
  onPaymentExecute,
  onConnectWallet,
  txSubscriptionHash,
  onClearTx
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
      onBondRequest={onBondRequest}
      onUnbondRequest={onUnbondRequest}
      refreshWhitelistFlag={refreshWhitelistFlag}
      oficialNodes={oficialNodes}
      onPaymentExecute={onPaymentExecute}
      onConnectWallet={onConnectWallet}
      txSubscriptionHash={txSubscriptionHash}
      onClearTx={onClearTx}
    />
  );
};

export default NodeDetailsPageWrapper; 