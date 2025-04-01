/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NodesPage from './pages/NodesPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import UserRequestsPage from './pages/UserRequestsPage';
import { Node, NodeOperatorFormData, WhitelistRequest } from './types';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import RuneBondEngine from './lib/runebondEngine/runebondEngine';

const AppContent: React.FC = () => {
  const [listedNodes, setListedNodes] = useState<Node[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allNodes, setAllNodes] = useState<any[]>([]); // TODO: Fix types
  const [witheListsRequests, setWhitelistRequests] = useState<{ operator: WhitelistRequest[], user: WhitelistRequest[] }>({ operator: [], user: [] });

  const { address, isConnected, error, connect, disconnect } = useWallet();
  
  // Initialize RuneBondEngine and load Nodes
  useEffect(() => {
    const initializeEngine = async () => {
      const engine = RuneBondEngine.getInstance();
      await engine.initialize();

      const nodes = await engine.getAllNodes()
      const listedNodes = engine.getListedNodes()

      setAllNodes(nodes)
      setListedNodes(listedNodes)

      if (address) {
        const requests = await engine.getWhitelistRequests(address as string)
        setWhitelistRequests(requests);
      } 
    };

    initializeEngine();
  }, [address]);

  // Display wallet errors
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  const handleConnect = async () => {
    await connect();
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

  // Node functions
  const handleCreateListing = async (formData: NodeOperatorFormData) => {
    try {
      const engine = RuneBondEngine.getInstance();
      await engine.sendListingTransaction({
        nodeAddress: formData.address,
        operatorAddress: address || '',
        minRune: Number(formData.minimumBond),
        maxRune: Number(formData.bondingCapacity),
        feePercentage: Number(formData.feePercentage)
      });
      
      toast.success('Listing created successfully!');
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
      await engine.sendEnableBondRequest(request);

      toast.success('Enable bond request submitted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error submitting enable bond request';
      toast.error(errorMessage);
    }
  };

  const handleRejectRequest = (_request: WhitelistRequest) => {
    // TODO: Implement logic
  };

  return (
    <Router>
      <Layout
        isAuthenticated={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        walletAddress={address}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/nodes"
            element={
              <NodesPage
                nodes={listedNodes}
                isAuthenticated={isConnected}
              />
            }
          />
          <Route
            path="/operator-dashboard"
            element={
              <OperatorDashboardPage
                nodes={listedNodes.filter(op => op.operatorAddress === address)}
                availableNodes={allNodes.filter(node => import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR ? node.node_operator_address === import.meta.env.VITE_TEST_FAKE_NODE_OPERATOR : node.node_operator_address === address)}
                requests={witheListsRequests.operator}
                onCreateListing={handleCreateListing}
                onDeleteListing={handleDeleteListing}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
              />
            }
          />
          <Route
            path="/user-requests"
            element={<UserRequestsPage requests={witheListsRequests.user} />}
          />
        </Routes>
      </Layout>
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
