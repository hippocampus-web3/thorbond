import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import { shortenAddress } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';


interface HeaderProps {
  isAuthenticated: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  walletAddress: string | null;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  onConnect,
  onDisconnect,
  walletAddress
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleConnect = async () => {
    await onConnect();
  };

  const handleDisconnect = async () => {
    await onDisconnect();
  };

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/runebond-isologo.svg" 
                  alt="RUNE" 
                  className="h-12 w-12"
                />
              </Link>
            </div>

            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/nodes"
                className={`${
                  isActive('/nodes')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Nodes
              </Link>
              <Link
                to="/operator-dashboard"
                className={`${
                  isActive('/operator-dashboard')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Operator Dashboard
              </Link>
              <Link
                to="/user-requests"
                className={`${
                  isActive('/user-requests')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                My Requests
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {walletAddress && shortenAddress(walletAddress)}
                  </span>
                  <button
                    onClick={() => handleCopy(walletAddress!)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy address"
                  >
                    {copiedAddress === walletAddress ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleDisconnect}
                  className="text-sm"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                className="text-sm"
              >
                Connect Wallet
              </Button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/nodes"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/nodes')
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Nodes
          </Link>
          <Link
            to="/operator-dashboard"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/operator-dashboard')
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Operator Dashboard
          </Link>
          <Link
            to="/user-requests"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/user-requests')
                ? 'border-blue-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            My Requests
          </Link>
          <div className="pl-3 pr-4 py-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    {walletAddress && shortenAddress(walletAddress)}
                  </div>
                  <button
                    onClick={() => handleCopy(walletAddress!)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy address"
                  >
                    {copiedAddress === walletAddress ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleDisconnect}
                  className="w-full text-sm"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                className="w-full text-sm"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
