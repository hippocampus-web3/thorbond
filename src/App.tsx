import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NodeOperatorsPage from './pages/NodeOperatorsPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import UserRequestsPage from './pages/UserRequestsPage';
import { NodeOperator, WhitelistRequest, User } from './types';
import { mockNodeOperators, mockWhitelistRequests, mockUsers } from './lib/mockData';

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [nodeOperators, setNodeOperators] = useState<NodeOperator[]>(mockNodeOperators);
  const [whitelistRequests, setWhitelistRequests] = useState<WhitelistRequest[]>(mockWhitelistRequests);

  // Authentication
  const handleConnect = () => {
    // In a real app, this would connect to a wallet
    // For demo purposes, we'll just use the first mock user
    setUser(mockUsers[0]);
  };

  const handleDisconnect = () => {
    setUser(null);
  };

  // Node Operator functions
  const handleCreateListing = (formData: any) => {
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

  const handleUpdateListing = (formData: any) => {
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
  const handleRequestWhitelist = (nodeOperatorId: string, formData: any) => {
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
        isAuthenticated={!!user}
        isNodeOperator={!!userNodeOperator}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
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
            path="/my-requests"
            element={
              <UserRequestsPage
                requests={userRequests}
                isAuthenticated={!!user}
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
