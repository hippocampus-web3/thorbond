import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                THORChain Node Operator Bonding Platform
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                Connect node operators with users for seamless RUNE token bonding opportunities.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/node-operators">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700 hover:text-blue-700">
                    Find Node Operators
                  </Button>
                </Link>
                <Link to="/operator-dashboard">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700 hover:text-blue-700">
                    Node Operator Portal
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-500 rounded-full opacity-20"></div>
                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-500 rounded-full opacity-20"></div>
                <div className="relative bg-white p-8 rounded-lg shadow-xl">
                  <div className="flex justify-center">
                    <img 
                      src="https://assets.coingecko.com/coins/images/6595/small/RUNE.png" 
                      alt="RUNE" 
                      className="h-24 w-24"
                    />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Connect with trusted node operators</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Wallet className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Secure bonding process</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Real-time notifications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies the THORChain node operator bonding process for both operators and users.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <img 
                  src="https://assets.coingecko.com/coins/images/6595/small/RUNE.png" 
                  alt="RUNE" 
                  className="h-6 w-6"
                />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">For Node Operators</h3>
              <p className="mt-2 text-gray-600">
                Publish your bonding opportunities, set your terms, and manage whitelist requests from a single dashboard.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">For Users</h3>
              <p className="mt-2 text-gray-600">
                Browse available node operators, compare terms, and request whitelisting for RUNE token bonding.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Secure & Transparent</h3>
              <p className="mt-2 text-gray-600">
                All interactions are secured with blockchain address validation and real-time notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-lg text-blue-100 max-w-3xl">
                  Join the THORChain ecosystem and start bonding with trusted node operators today.
                </p>
              </div>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link to="/node-operators">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700 hover:text-blue-700">
                      Find Node Operators
                    </Button>
                  </Link>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Link to="/operator-dashboard">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-800 hover:text-blue-700">
                      Node Operator Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
