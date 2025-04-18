/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NodesPage from './pages/NodesPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import UserRequestsPage from './pages/UserRequestsPage';
import NodeDetailsPageWrapper from './pages/NodeDetailsPageWrapper';
import { Node, NodeOperatorFormData, WhitelistRequest, WhitelistRequestFormData, SendMessageParams } from './types';
import { WalletProvider, WalletType, useWallet } from './contexts/WalletContext';
import RuneBondEngine from './lib/runebondEngine/runebondEngine';
import WalletConnectPopup from './components/wallet/WalletConnectPopup';
import KeystoreUploadPopup from './components/wallet/KeystoreUploadPopup';
import TransactionConfirmationPopup from './components/wallet/TransactionConfirmationPopup';
import { Keystore } from '@xchainjs/xchain-crypto';
import { Message } from './types';
import LoadingSpinner from './components/ui/LoadingSpinner';

const AppContent: React.FC = () => {
  const [listedNodes, setListedNodes] = useState<Node[]>([]);
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [witheListsRequests, setWhitelistRequests] = useState<{ operator: WhitelistRequest[], user: WhitelistRequest[] }>({ operator: [], user: [] });
  const [searchOperator, setSearchOperator] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isWalletPopupOpen, setIsWalletPopupOpen] = useState(false);
  const [isKeystorePopupOpen, setIsKeystorePopupOpen] = useState(false);
  const [showTransactionConfirmation, setShowTransactionConfirmation] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [isEngineInitialized, setIsEngineInitialized] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'listing' | 'whitelist' | 'enableBond' | 'bond' | 'unbond' | 'message';
    data: any;
    callback: () => Promise<void>;
  } | null>(null);

  const { address, isConnected, connect, disconnect, walletProvider } = useWallet();

  const addressTofilter = address || searchOperator || searchUser || import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR;

  // Initialize engine only once when app starts
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        const engine = RuneBondEngine.getInstance();
        await engine.initialize();
        setIsEngineInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error initializing RuneBondEngine';
        toast.error(errorMessage);
      }
    };

    initializeEngine();
  }, []);

  // Load nodes and requests only after engine is initialized
  useEffect(() => {
    const loadData = async () => {
      if (!isEngineInitialized) return;
      
      try {
        setIsLoadingNodes(true);
        const engine = RuneBondEngine.getInstance();

        if (isConnected) {
          const nodes = engine.getAllNodes()
          setAllNodes(nodes)
        }
        const listedNodes = engine.getListedNodes()
        setListedNodes(listedNodes)

        if (addressTofilter) {
          const requests = await engine.getWhitelistRequests(addressTofilter as string)
          setWhitelistRequests(requests);
        } else {
          setWhitelistRequests({ user: [], operator: [] });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading nodes';
        toast.error(errorMessage);
      } finally {
        setIsLoadingNodes(false);
      }
    };

    loadData();
  }, [addressTofilter, isConnected, isEngineInitialized]);

  useEffect(() => {
    if (isConnected) {
      setSearchUser('')
      setSearchOperator('')
    }
  }, [isConnected]);

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
        toast.success('Wallet connected successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error connecting wallet';
      toast.error(errorMessage);
    }
  };

  const handleKeystoreUpload = async (file: File, password: string) => {
    try {
      const fileContent = await file.text();
      let keystoreData: Keystore;

      try {
        keystoreData = JSON.parse(fileContent);
      } catch (e) {
        throw new Error('Invalid keystore file format');
      }

      if (!keystoreData.crypto) {
        throw new Error('Invalid keystore file format');
      }

      await connect('keystore', { keystoreData, password });

      setIsKeystorePopupOpen(false);

      toast.success('Keystore uploaded and decrypted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing keystore';
      toast.error(errorMessage);
      setIsKeystorePopupOpen(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.info('Wallet disconnected', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
        maxRune: Number(formData.bondingCapacity),
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
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating listing';
      toast.error(errorMessage);
    }
  };

  const handleDeleteListing = () => {
    // TODO: Implement logic
  };

  const handleApproveRequest = async (request: WhitelistRequest) => {
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
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting enable bond request';
      toast.error(errorMessage);
    }
  };

  const handleRejectRequest = (_request: WhitelistRequest) => {
    // TODO: Implement logic
  };

  const handleRequestWhitelist = (node: Node) => {
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

    try {
      const engine = RuneBondEngine.getInstance();
      const whitelistParams = {
        nodeAddress: selectedNode.nodeAddress,
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
        callback: async () => {
          const hash = await engine.sendWhitelistRequest(
            whitelistParams,
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
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
      await pendingTransaction.callback();
      toast.success('Transaction submitted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting transaction';
      toast.error(errorMessage);
    } finally {
      setShowTransactionConfirmation(false);
      setPendingTransaction(null);
      setIsTransactionLoading(false);
    }
  };

  const handleBondRequest = async (request: WhitelistRequest) => {
    try {
      const engine = RuneBondEngine.getInstance();
      const transaction = await engine.sendBondRequest(
        request,
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'bond',
        data: transaction,
        callback: async () => {
          const hash = await engine.sendBondRequest(
            request,
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting bond request';
      toast.error(errorMessage);
    }
  };

  const handleUnbondRequest = async (request: WhitelistRequest) => {
    try {
      const engine = RuneBondEngine.getInstance();
      const transaction = await engine.sendUnbondRequest(
        request,
        undefined,
        undefined,
        true
      );

      setPendingTransaction({
        type: 'unbond',
        data: transaction,
        callback: async () => {
          const hash = await engine.sendUnbondRequest(
            request,
            isConnected as WalletType,
            walletProvider as WalletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed to send. Please try again or check your network and wallet settings.');
          }
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
      
      const nodeData = engine.getAllNodes();
      const node = nodeData.find(n => n.node_address === nodeAddress);
      if (!node) {
        throw new Error("Node not found");
      }

      let role: 'USER' | 'BP' | 'NO' = 'USER';
      
      if (address === node.node_address) {
        role = 'NO';
      } else {
        const isBondProvider = node.bond_providers?.providers?.some(
          (provider: any) => provider.bond_address === address && provider.bond > 0
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
        callback: async () => {
          const hash = await engine.sendMessageTransaction(
            messageParams,
            isConnected as WalletType,
            walletProvider
          );
          if (!hash) {
            throw new Error('Transaction failed or was rejected.');
          }
        }
      });
      setShowTransactionConfirmation(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error sending message';
      toast.error(errorMessage);
    }
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
      <Layout
        isAuthenticated={isConnected !== null}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        walletAddress={address}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/nodes"
            element={
              !isEngineInitialized ? (
                <LoadingScreen message="Loading nodes..." />
              ) : (
                <NodesPage
                  nodes={listedNodes}
                  isLoading={isLoadingNodes}
                  selectedNode={selectedNode}
                  onRequestWhitelist={handleRequestWhitelist}
                  onSubmitRequest={handleSubmitRequest}
                  onCancelRequest={handleCancelRequest}
                />
              )
            }
          />
          <Route
            path="/nodes/:nodeAddress"
            element={
              !isEngineInitialized ? (
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
                />
              )
            }
          />
          <Route
            path="/operator-dashboard"
            element={
              !isEngineInitialized ? (
                <LoadingScreen message="Loading operator dashboard..." />
              ) : (
                <OperatorDashboardPage
                  nodes={listedNodes.filter(op => op.operatorAddress === addressTofilter)}
                  availableNodes={allNodes.filter(node => import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR ? node.node_operator_address === import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR : node.node_operator_address === addressTofilter)}
                  requests={witheListsRequests.operator}
                  onCreateListing={handleCreateListing}
                  onDeleteListing={handleDeleteListing}
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
              !isEngineInitialized ? (
                <LoadingScreen message="Loading user requests..." />
              ) : (
                <UserRequestsPage
                  requests={witheListsRequests.user}
                  onSearchUser={setSearchUser}
                  searchValue={searchUser}
                  isConnected={isConnected !== null}
                  isLoading={isLoadingNodes}
                  onBondRequest={handleBondRequest}
                  onUnbondRequest={handleUnbondRequest}
                />
              )
            }
          />
        </Routes>
      </Layout>
      <WalletConnectPopup
        isOpen={isWalletPopupOpen}
        onClose={() => setIsWalletPopupOpen(false)}
        onSelectWallet={handleSelectWallet}
      />
      <KeystoreUploadPopup
        isOpen={isKeystorePopupOpen}
        onClose={() => setIsKeystorePopupOpen(false)}
        onUpload={handleKeystoreUpload}
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
