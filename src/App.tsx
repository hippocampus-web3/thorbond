import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NodeOperatorsPage from './pages/NodeOperatorsPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import UserRequestsPage from './pages/UserRequestsPage';
import { NodeOperator, WhitelistRequest, User } from './types';
import { mockNodeOperators, mockWhitelistRequests, mockUsers } from './lib/mockData';
import { WalletProvider, useWallet } from './contexts/WalletContext';

interface NodeOperatorFormData {
  address: string;
  bondingCapacity: string;
  minimumBond: string;
  feePercentage: string;
  instantChurnAmount: string;
  description: string;
  contactInfo: string;
}

interface WhitelistRequestFormData {
  discordUsername: string;
  xUsername: string;
  telegramUsername: string;
  walletAddress: string;
  intendedBondAmount: string;
}

const AppContent: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [nodeOperators, setNodeOperators] = useState<NodeOperator[]>(mockNodeOperators);
  const [whitelistRequests, setWhitelistRequests] = useState<WhitelistRequest[]>(mockWhitelistRequests);
  
  const { address, isConnected, error, connect, disconnect } = useWallet();
  
  // Mostrar errores del wallet
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

  // Authentication
  const handleConnect = async () => {
    try {
      await connect();
      if (address) {
        // En una aplicación real, aquí harías una llamada a tu backend para obtener los datos del usuario
        // Por ahora, usaremos el primer usuario mock
        setUser({
          ...mockUsers[0],
          walletAddress: address,
        });
        toast.success('Wallet connected successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      // No mostramos el error aquí ya que el useEffect lo manejará
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setUser(null);
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

  // Node Operator functions
  const handleCreateListing = (formData: NodeOperatorFormData) => {
    if (!user) return;

    const newOperator: NodeOperator = {
      id: Date.now().toString(),
      address: formData.address,
      bondingCapacity: Number(formData.bondingCapacity),
      minimumBond: Number(formData.minimumBond),
      feePercentage: Number(formData.feePercentage),
      instantChurnAmount: Number(formData.instantChurnAmount),
      description: formData.description,
      contactInfo: formData.contactInfo,
      createdAt: new Date(),
    };

    setNodeOperators([...nodeOperators, newOperator]);
  };

  const handleUpdateListing = (formData: NodeOperatorFormData) => {
    if (!user) return;

    setNodeOperators(
      nodeOperators.map(op => 
        op.address === user.walletAddress
          ? {
              ...op,
              address: formData.address,
              bondingCapacity: Number(formData.bondingCapacity),
              minimumBond: Number(formData.minimumBond),
              feePercentage: Number(formData.feePercentage),
              instantChurnAmount: Number(formData.instantChurnAmount),
              description: formData.description,
              contactInfo: formData.contactInfo,
            }
          : op
      )
    );
  };

  const handleDeleteListing = () => {
    if (!user) return;

    setNodeOperators(nodeOperators.filter(op => op.address !== user.walletAddress));
  };

  // Whitelist request functions
  const handleRequestWhitelist = (nodeOperatorId: string, formData: WhitelistRequestFormData) => {
    if (!user) return;

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

  // Filter data based on user
  const userNodeOperator = user?.isNodeOperator
    ? nodeOperators.find(op => op.address === user.walletAddress) || null
    : null;

  const operatorRequests = userNodeOperator
    ? whitelistRequests.filter(req => req.nodeOperatorId === userNodeOperator.id)
    : [];

  const userRequests = user
    ? whitelistRequests.filter(req => req.walletAddress === user.walletAddress)
    : [];

  return (
    <Router>
      <Layout
        isAuthenticated={isConnected}
        isNodeOperator={!!userNodeOperator}
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
                isAuthenticated={!!user}
                onRequestWhitelist={handleRequestWhitelist}
              />
            }
          />
          <Route
            path="/operator-dashboard"
            element={
              <OperatorDashboardPage
                nodeOperator={userNodeOperator}
                requests={operatorRequests}
                isAuthenticated={!!user}
                isNodeOperator={!!userNodeOperator}
                onCreateListing={handleCreateListing}
                onUpdateListing={handleUpdateListing}
                onDeleteListing={handleDeleteListing}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
              />
            }
          />
          <Route
            path="/user-requests"
            element={<UserRequestsPage requests={userRequests} />}
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
