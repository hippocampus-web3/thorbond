import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { BaseAmount } from '@xchainjs/xchain-util';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  walletAddress: string | null;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isAuthenticated,
  onConnect,
  onDisconnect,
  walletAddress,
  balance,
  isLoadingBalance
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        isAuthenticated={isAuthenticated}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        walletAddress={walletAddress}
        balance={balance}
        isLoadingBalance={isLoadingBalance}
      />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
