import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center">
              <img 
                src="/runebond-logo-negative.png" 
                alt="RuneBond" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-300">
              The comprehensive platform for THORChain node operators and users to connect for bonding opportunities.
            </p>
            <div className="mt-4 flex space-x-6">
              <a 
                href="https://x.com/RuneBondApp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="https://t.me/RUNEBondApp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Telegram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a 
                  href="https://thorbond.gitbook.io/runebond" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://thorchain.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-300 hover:text-white"
                >
                  THORChain Website
                </a>
              </li>
              <li>
                <a 
                  href="https://thorchain.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Network Stats
                </a>
              </li>
              <li>
                <a 
                  href="https://runebondapp.canny.io/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-base text-gray-300 hover:text-white"
                >
                  Feedback & Suggestions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/" className="text-base text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/nodes" className="text-base text-gray-300 hover:text-white">
                  Nodes
                </Link>
              </li>
              <li>
                <Link to="/operator-dashboard" className="text-base text-gray-300 hover:text-white">
                  Operator Dashboard
                </Link>
              </li>
              <li>
                <Link to="/user-requests" className="text-base text-gray-300 hover:text-white">
                  My Requests
                </Link>
              </li>
              <li>
                <Link to="/earnings-simulator" className="text-base text-gray-300 hover:text-white">
                  Earnings Simulator
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} RUNEBond. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
