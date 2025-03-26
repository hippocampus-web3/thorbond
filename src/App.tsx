import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NodeOperatorsPage from './pages/NodeOperatorsPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import UserRequestsPage from './pages/UserRequestsPage';
import { NodeOperator, WhitelistRequest } from './types';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import ThorBondEngine from './lib/thorbondEngine';

interface NodeOperatorFormData {
  address: string;
  bondingCapacity: string;
  minimumBond: string;
  feePercentage: string;
}

interface WhitelistRequestFormData {
  discordUsername: string;
  xUsername: string;
  telegramUsername: string;
  walletAddress: string;
  intendedBondAmount: string;
}

const AppContent: React.FC = () => {
  const [nodeOperators, setNodeOperators] = useState<NodeOperator[]>([]);
  const [whitelistRequests, setWhitelistRequests] = useState<WhitelistRequest[]>([]);

  const { address, isConnected, error, connect, disconnect } = useWallet();
  
  // Initialize ThorBondEngine and load Nodes
  useEffect(() => {
    const initializeEngine = async () => {
      const engine = ThorBondEngine.getInstance();
      await engine.initialize();
      setNodeOperators(engine.getNodes());
    };

    initializeEngine();
  }, []);

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
      const engine = ThorBondEngine.getInstance();
      await engine.sendListingTransaction({
        nodeAddress: formData.address,
        operatorAddress: address || '',
        minRune: Number(formData.minimumBond),
        maxRune: Number(formData.bondingCapacity),
        feePercentage: Number(formData.feePercentage)
      });

      // Update Nodes list after creating a new one
      await engine.refreshActions();
      setNodeOperators(engine.getNodes());
      
      toast.success('Listing created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating listing';
      toast.error(errorMessage);
    }
  };

  const handleDeleteListing = () => {
    setNodeOperators(nodeOperators.filter(op => op.address !== address));
  };

  // Whitelist request functions
  const handleRequestWhitelist = (nodeOperatorId: string, formData: WhitelistRequestFormData) => {
    const newRequest: WhitelistRequest = {
      id: Date.now().toString(),
      nodeOperatorId,
      discordUsername: formData.discordUsername,
      xUsername: formData.xUsername,
      telegramUsername: formData.telegramUsername,
      walletAddress: formData.walletAddress,
      intendedBondAmount: Number(formData.intendedBondAmount),
      status: 'pending',
      createdAt: new Date(),
    };

    setWhitelistRequests([...whitelistRequests, newRequest]);
  };

  const handleApproveRequest = (requestId: string) => {
    setWhitelistRequests(
      whitelistRequests.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setWhitelistRequests(
      whitelistRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected', rejectionReason: reason } : req
      )
    );
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
            path="/node-operators"
            element={
              <NodeOperatorsPage
                nodeOperators={nodeOperators}
                onRequestWhitelist={handleRequestWhitelist}
                isAuthenticated={isConnected}
              />
            }
          />
          <Route
            path="/operator-dashboard"
            element={
              <OperatorDashboardPage
                nodeOperators={nodeOperators}
                requests={whitelistRequests}
                onCreateListing={handleCreateListing}
                onDeleteListing={handleDeleteListing}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
              />
            }
          />
          <Route
            path="/user-requests"
            element={<UserRequestsPage requests={whitelistRequests} />}
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
