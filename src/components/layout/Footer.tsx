import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center">
              <img 
                src="/thorbond-logo.png" 
                alt="ThorBond" 
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold">ThorBond</span>
            </div>
            <p className="mt-2 text-sm text-gray-300">
              The comprehensive platform for THORChain node operators and users to connect for bonding opportunities.
            </p>
            <div className="mt-4 flex space-x-6">
              <a href="https://twitter.com/thorchain" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://github.com/thorchain" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://docs.thorchain.org/" className="text-base text-gray-300 hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://thorchain.org/" className="text-base text-gray-300 hover:text-white">
                  THORChain Website
                </a>
              </li>
              <li>
                <a href="https://thorchain.net/" className="text-base text-gray-300 hover:text-white">
                  Network Stats
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
                <Link to="/my-requests" className="text-base text-gray-300 hover:text-white">
                  My Requests
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
