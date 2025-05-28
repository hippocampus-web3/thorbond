/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NodesPage from './pages/NodesPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import UserRequestsPage from './pages/UserRequestsPage';
import NodeDetailsPageWrapper from './pages/NodeDetailsPageWrapper';
import { NodeOperatorFormData, WhitelistRequestFormData, SendMessageParams } from './types';
import { WalletProvider, WalletType, useWallet } from './contexts/WalletContext';
import RuneBondEngine from './lib/runebondEngine/runebondEngine';
import WalletConnectPopup from './components/wallet/WalletConnectPopup';
import KeystoreUploadPopup from './components/wallet/KeystoreUploadPopup';
import TransactionConfirmationPopup from './components/wallet/TransactionConfirmationPopup';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import { assetAmount, assetToBase, BaseAmount } from '@xchainjs/xchain-util';
import { useTransactionPolling } from './hooks/useTransactionPolling';
import { NodesResponse } from '@xchainjs/xchain-thornode';
import EarningsSimulatorPage from './pages/EarningsSimulatorPage';
import NodeProfileLayout from './components/layout/NodeProfileLayout';
import { ChatMessageDto, NodeListingDto, WhitelistRequestDto } from '@hippocampus-web3/runebond-client';

const AppContent: React.FC = () => {
  const [listedNodes, setListedNodes] = useState<NodeListingDto[]>([]);
  const [allNodes, setAllNodes] = useState<NodesResponse>([]);
  const [witheListsRequests, setWhitelistRequests] = useState<{ operator: WhitelistRequestDto[], user: WhitelistRequestDto[] }>({ operator: [], user: [] });
  const [searchOperator, setSearchOperator] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageDto[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeListingDto | null>(null);
  const [isWalletPopupOpen, setIsWalletPopupOpen] = useState(false);
  const [isKeystorePopupOpen, setIsKeystorePopupOpen] = useState(false);
  const [showTransactionConfirmation, setShowTransactionConfirmation] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [balance, setBalance] = useState<BaseAmount | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'listing' | 'whitelist' | 'enableBond' | 'bond' | 'unbond' | 'message' | 'subscription';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    additionalInfo?: {
      nodeAddress?: string,
      intendedBondAmount?: string,
      nodeInfo?: NodeListingDto;
    };
    callback: () => Promise<string>;
  } | null>(null);
  const [refreshWhitelistFlag, setRefreshWhitelistFlag] = useState(0);
  const [txSubscriptionHash, setTxSubscriptionHash] = useState<string | null>(null);
  const [nodeAddress, setNodeAddress] = useState<string | null>(null);

  const { address, isConnected, connect, disconnect, walletProvider } = useWallet();
  const addressTofilter = address || searchOperator || searchUser;

  const { startPolling, stopPolling } = useTransactionPolling({
    onTransactionConfirmed: async (type, additionalInfo) => {
      try {
        const engine = RuneBondEngine.getInstance();
        
        if (isConnected) {
          const addressBalance = await engine.getAddressBalance(addressTofilter);
          setBalance(addressBalance);
          const nodes = await engine.getAllNodes();
          setAllNodes(nodes);
        }
        const listedNodes = await engine.getListedNodes();
        setListedNodes(listedNodes);

        if (addressTofilter) {
          const requests = await engine.getWhitelistRequests(addressTofilter);
          setWhitelistRequests(requests);
        }

        if (type === 'message' && additionalInfo?.nodeAddress) {
          const messages = await engine.getChatMessages(additionalInfo.nodeAddress);
          setChatMessages(messages);
        }

        if (type === 'bond' || type === 'unbond') {
          setRefreshWhitelistFlag(Date.now());
        }

        if (type === 'subscription' && additionalInfo?.txId) {
          setTxSubscriptionHash(additionalInfo.txId);
        }
      } catch (error) {
        console.error('Error updating state after transaction confirmation:', error);
        toast.error('Error confirming transaction. Please check the status manually.');
      }
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingNodes(true);
        const engine = RuneBondEngine.getInstance();

        if (isConnected) {
          const nodes = await engine.getAllNodes();
          setAllNodes(nodes);
        }
        const listedNodes = await engine.getListedNodes();
        setListedNodes(listedNodes);

        if (addressTofilter) {
          const requests = await engine.getWhitelistRequests(addressTofilter);
          setWhitelistRequests(requests);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingNodes(false);
      }
    };

    loadData();
  }, [addressTofilter, isConnected]);

  useEffect(() => {
    if (isConnected) {
      setSearchUser('')
      setSearchOperator('')
    }
  }, [isConnected]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        setIsLoadingBalance(true);
        try {
          const engine = RuneBondEngine.getInstance();
          const addressBalance = await engine.getAddressBalance(address);
          setBalance(addressBalance);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [address]);

  useEffect(() => {
    const host = window.location.host;
    const subdomain = host.split('.')[0];
    
    // Verificar si estamos en un subdominio válido
    if (subdomain && subdomain !== 'www' && subdomain !== 'runebond') {
      // Verificar si el subdominio corresponde a un nodo válido
      const isValidNode = listedNodes.some(node => node.nodeAddress === subdomain);
      if (isValidNode) {
        setNodeAddress(subdomain);
      }
    }
  }, [listedNodes]);

  const loadChatMessages = useCallback(async (nodeAddr: string) => {
    if (!nodeAddr) return;
    try {
      setIsLoadingMessages(true);
      const engine = RuneBondEngine.getInstance();
      const messages = await engine.getChatMessages(nodeAddr);
      setChatMessages(messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading chat messages';
      toast.error(errorMessage);
      setChatMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const handleConnect = async () => {
    setIsWalletPopupOpen(true);
  };

  const handleSelectWallet = async (walletType: WalletType) => {
    try {
      setIsWalletPopupOpen(false);
      if (walletType === 'keystore') {
        setIsKeystorePopupOpen(true);
        return;
      }
      await connect(walletType);
      if (address) {
        toast.success('Wallet connected successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error connecting wallet';
      toast.error(errorMessage);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error disconnecting wallet';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCreateListing = async (formData: NodeOperatorFormData) => {
    try {
      const engine = RuneBondEngine.getInstance();
      const listingParams = {
        nodeAddress: formData.address,
        operatorAddress: address || '',
        minRune: Number(formData.minimumBond),
        totalBondTarget: Number(formData.totalBondTarget),
        feePercentage: Number(formData.feePercentage)
      };

      const transaction = await engine.sendListingTransaction(
        listingParams,
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'listing',
        data: transaction,
        callback: async () => {
          const hash = await engine.sendListingTransaction(
            listingParams,
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
          return hash as string;
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating listing';
      toast.error(errorMessage);
    }
  };

  const handleApproveRequest = async (request: WhitelistRequestDto) => {
    try {
      const engine = RuneBondEngine.getInstance();
      const transaction = await engine.sendEnableBondRequest(
        request,
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'enableBond',
        data: transaction,
        callback: async () => {
          const hash = await engine.sendEnableBondRequest(
            request,
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
          return hash as string;
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting enable bond request';
      toast.error(errorMessage);
    }
  };

  const handleRejectRequest = (_request: WhitelistRequestDto) => {
    // TODO: Implement logic
  };

  const handleRequestWhitelist = (node: NodeListingDto) => {
    if (!isConnected) {
      toast.error('Please connect your wallet to request whitelisting.');
      return;
    }

    const selectedNode = listedNodes.find(n => n.nodeAddress === node.nodeAddress);
    if (selectedNode) {
      setSelectedNode(selectedNode);
    }
  };

  const handleSubmitRequest = async (formData: WhitelistRequestFormData) => {
    if (!selectedNode || !address) return;

    const nodeAddressToWhitelist = selectedNode.nodeAddress;

    // Find the node info from listedNodes
    const nodeToWhitelist = listedNodes.find(n => n.nodeAddress === nodeAddressToWhitelist);
    if (!nodeToWhitelist) {
      toast.error("Could not find node details to confirm whitelist request.");
      return;
    }

    try {
      const engine = RuneBondEngine.getInstance();
      const whitelistParams = {
        nodeAddress: nodeAddressToWhitelist,
        userAddress: formData.walletAddress,
        amount: Number(formData.intendedBondAmount)
      };

      const transaction = await engine.sendWhitelistRequest(
        whitelistParams,
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'whitelist',
        data: transaction,
        additionalInfo: {
          intendedBondAmount: assetToBase(assetAmount(formData.intendedBondAmount)).amount().toString(),
          nodeInfo: nodeToWhitelist
        },
        callback: async () => {
          const hash = await engine.sendWhitelistRequest(
            whitelistParams,
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
          return hash as string;
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting whitelist request';
      toast.error(errorMessage);
    }
  };

  const handleCancelRequest = () => {
    setSelectedNode(null);
  };

  const handleConfirmTransaction = async () => {
    if (!pendingTransaction) return;

    try {
      setIsTransactionLoading(true);
      const txId = await pendingTransaction.callback();
      
      if (txId) {
        const message = `Transaction submitted! Waiting for confirmation...`;
        startPolling(txId, message, addressTofilter, pendingTransaction.type, pendingTransaction.data, pendingTransaction?.additionalInfo?.nodeAddress || null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting transaction';
      toast.error(errorMessage);
      stopPolling();
    } finally {
      setShowTransactionConfirmation(false);
      setPendingTransaction(null);
      setIsTransactionLoading(false);
    }
  };

  const handleBondRequest = async (
    nodeAddress: string,
    userAddress: string,
    amount: number
  ) => {
    try {
      const nodeToBond = listedNodes.find(n => n.nodeAddress === nodeAddress);
      if (!nodeToBond) {
        toast.error("Could not find node details to confirm bond.");
        return;
      }

      const engine = RuneBondEngine.getInstance();
      const transaction = await engine.sendBondRequest(
        {
          nodeAddress,
          userAddress,
          amount
        },
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'bond',
        data: transaction,
        additionalInfo: {
          nodeInfo: nodeToBond
        },
        callback: async () => {
          const hash = await engine.sendBondRequest(
            {
              nodeAddress,
              userAddress,
              amount
            },
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
          return typeof hash === 'string' ? hash : hash.toString();
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting bond request';
      toast.error(errorMessage);
    }
  };

  const handleUnbondRequest = async (
    nodeAddress: string,
    userAddress: string,
    amount: number
  ) => {
    try {
      const engine = RuneBondEngine.getInstance();
      const transaction = await engine.sendUnbondRequest(
        {
          nodeAddress,
          userAddress,
          amount
        },
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'unbond',
        data: transaction,
        callback: async () => {
          const hash = await engine.sendUnbondRequest(
            {
              nodeAddress,
              userAddress,
              amount
            },
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
          return typeof hash === 'string' ? hash : hash.toString();
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting unbond request';
      toast.error(errorMessage);
    }
  };

  const handleSendMessage = async (nodeAddress: string, message: string) => {
    if (!address) {
      toast.error("Please connect your wallet to send a message.");
      return;
    }
    if (!walletProvider || !isConnected) {
      toast.error("Wallet provider or connection type missing.");
      return;
    }

    try {
      const engine = RuneBondEngine.getInstance();
      
      const nodeData = await engine.getAllNodes();
      const node = nodeData.find((n) => n.node_address === nodeAddress);
      if (!node) {
        throw new Error("Node not found");
      }

      let role: 'USER' | 'BP' | 'NO' = 'USER';
      
      if (address === node.node_address) {
        role = 'NO';
      } else {
        const isBondProvider = node.bond_providers?.providers?.some(
          (provider) => provider.bond_address === address && provider?.bond || -1 > 0
        );
        if (isBondProvider) {
          role = 'BP';
        }
      }

      const messageParams: SendMessageParams = {
        nodeAddress,
        message,
        senderAddress: address,
        role
      };

      const transaction = await engine.sendMessageTransaction(
        messageParams,
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'message',
        data: transaction,
        additionalInfo: {
          nodeAddress
        },
        callback: async () => {
          const hash = await engine.sendMessageTransaction(
            messageParams,
            isConnected as WalletType,
            walletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed or was rejected.');
          }
          return typeof hash === 'string' ? hash : hash.toString();
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error sending message';
      toast.error(errorMessage);
    }
  };

  const handlePaymentExecute = async (memo: string, amount: number) => {
    try {
      const engine = RuneBondEngine.getInstance();
      const transaction = await engine.sendSubscriptionPayment(
        {
          memo,
          userAddress: address || '',
          amount
        },
        isConnected as WalletType,
        walletProvider as WalletProvider,
        true
      );

      setPendingTransaction({
        type: 'subscription',
        data: transaction,
        callback: async () => {
          const hash = await engine.sendSubscriptionPayment(
            {
              memo,
              userAddress: address || '',
              amount
            },
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
          return hash as string;
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing subscription payment';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleClearTx = () => {
    setTxSubscriptionHash(null);
  };

  const LoadingScreen = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {nodeAddress ? (
          <Route
            path="/*"
            element={
              !allNodes || !listedNodes ? (
                <LoadingScreen message="Loading node profile..." />
              ) : (
                <NodeProfileLayout
                  nodes={listedNodes}
                  onRequestWhitelist={handleRequestWhitelist}
                  selectedNode={selectedNode}
                  onSubmitRequest={handleSubmitRequest}
                  onCancelRequest={handleCancelRequest}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoadingMessages={isLoadingMessages}
                  balance={balance}
                  isLoadingBalance={isLoadingBalance}
                  onBondRequest={handleBondRequest}
                  onUnbondRequest={handleUnbondRequest}
                  refreshWhitelistFlag={refreshWhitelistFlag}
                  oficialNodes={allNodes}
                  onPaymentExecute={handlePaymentExecute}
                  onConnectWallet={handleConnect}
                  txSubscriptionHash={txSubscriptionHash}
                  onClearTx={handleClearTx}
                  isAuthenticated={isConnected !== null}
                  walletAddress={address}
                />
              )
            }
          />
        ) : (
          <Route
            path="/*"
            element={
              <Layout
                isAuthenticated={isConnected !== null}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                walletAddress={address}
                balance={balance}
                isLoadingBalance={isLoadingBalance}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/nodes"
                    element={
                      !allNodes || !listedNodes ? (
                        <LoadingScreen message="Loading nodes..." />
                      ) : (
                        <NodesPage
                          nodes={listedNodes}
                          isLoading={isLoadingNodes}
                          onRequestWhitelist={handleRequestWhitelist}
                        />
                      )
                    }
                  />
                  <Route
                    path="/nodes/:nodeAddress"
                    element={
                      !allNodes || !listedNodes ? (
                        <LoadingScreen message="Loading node details..." />
                      ) : (
                        <NodeDetailsPageWrapper 
                          listedNodes={listedNodes}
                          selectedNodeState={selectedNode}
                          onRequestWhitelist={handleRequestWhitelist}
                          onSubmitRequest={handleSubmitRequest}
                          onCancelRequest={handleCancelRequest}
                          messages={chatMessages}
                          onSendMessage={handleSendMessage}
                          loadChatMessages={loadChatMessages}
                          isLoadingMessages={isLoadingMessages}
                          balance={balance}
                          isLoadingBalance={isLoadingBalance}
                          onBondRequest={handleBondRequest}
                          onUnbondRequest={handleUnbondRequest}
                          refreshWhitelistFlag={refreshWhitelistFlag}
                          oficialNodes={allNodes}
                          onPaymentExecute={handlePaymentExecute}
                          onConnectWallet={handleConnect}
                          txSubscriptionHash={txSubscriptionHash}
                          onClearTx={handleClearTx}
                        />
                      )
                    }
                  />
                  <Route
                    path="/operator-dashboard"
                    element={
                      !allNodes || !listedNodes || !witheListsRequests ? (
                        <LoadingScreen message="Loading operator dashboard..." />
                      ) : (
                        <OperatorDashboardPage
                          nodes={listedNodes.filter(op => op.operatorAddress === addressTofilter)}
                          availableNodes={allNodes.filter(node => import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR ? node.node_operator_address === import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR : node.node_operator_address === addressTofilter)}
                          requests={witheListsRequests.operator}
                          onCreateListing={handleCreateListing}
                          onApproveRequest={handleApproveRequest}
                          onRejectRequest={handleRejectRequest}
                          onSearchOperator={setSearchOperator}
                          isLoading={isLoadingNodes}
                        />
                      )
                    }
                  />
                  <Route
                    path="/user-requests"
                    element={
                      !allNodes || !listedNodes || !witheListsRequests  ? (
                        <LoadingScreen message="Loading user requests..." />
                      ) : (
                        <UserRequestsPage
                          requests={witheListsRequests.user}
                          onSearchUser={setSearchUser}
                          searchValue={searchUser}
                          isConnected={isConnected !== null}
                          isLoading={isLoadingNodes}
                          onPaymentExecute={handlePaymentExecute}
                          onConnectWallet={handleConnect}
                          txSubscriptionHash={txSubscriptionHash}
                          onClearTx={handleClearTx}
                        />
                      )
                    }
                  />
                  <Route
                    path="/earnings-simulator"
                    element={<EarningsSimulatorPage />}
                  />
                </Routes>
              </Layout>
            }
          />
        )}
      </Routes>
      <WalletConnectPopup
        isOpen={isWalletPopupOpen}
        onClose={() => setIsWalletPopupOpen(false)}
        onSelectWallet={handleSelectWallet}
      />
      <KeystoreUploadPopup
        isOpen={isKeystorePopupOpen}
        onClose={() => setIsKeystorePopupOpen(false)}
      />
      {pendingTransaction && (
        <TransactionConfirmationPopup
          isOpen={showTransactionConfirmation}
          onClose={() => {
            setShowTransactionConfirmation(false);
            setPendingTransaction(null);
          }}
          onConfirm={handleConfirmTransaction}
          transaction={pendingTransaction.data}
          transactionType={pendingTransaction.type}
          isLoading={isTransactionLoading}
          additionalInfo={pendingTransaction.additionalInfo}
        />
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;
