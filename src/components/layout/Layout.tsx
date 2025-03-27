import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  walletAddress: string | null;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isAuthenticated,
  onConnect,
  onDisconnect,
  walletAddress
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        isAuthenticated={isAuthenticated}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        walletAddress={walletAddress}
      />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
