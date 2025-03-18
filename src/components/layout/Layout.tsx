import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isNodeOperator: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isAuthenticated,
  isNodeOperator,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isAuthenticated={isAuthenticated}
        isNodeOperator={isNodeOperator}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
