import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Node } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RuneBondEngine from '../lib/runebondEngine/runebondEngine';

interface NodeProfilePageProps {
  onRequestWhitelist: (node: Node) => void;
}

const NodeProfilePage: React.FC<NodeProfilePageProps> = ({
  onRequestWhitelist
}) => {
  const { address } = useParams<{ address: string }>();
  const [node, setNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNodeData = async () => {
      if (!address) return;
      
      try {
        setIsLoading(true);
        const engine = RuneBondEngine.getInstance();
        const nodes = await engine.getListedNodes();
        const foundNode = nodes.find(n => n.nodeAddress === address);
        if (foundNode) {
          setNode(foundNode);
        }
      } catch (error) {
        console.error('Error fetching node data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodeData();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Nodo no encontrado</h1>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mt-4">
          {node.bannerImage && (
            <img
              src={node.bannerImage}
              alt="Node Banner"
              className="w-full h-full object-cover opacity-50 rounded-xl"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end space-x-6">
              <div className="relative">
                <img
                  src={node.logo || '/default-node-logo.png'}
                  alt={node.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="text-white">
                <h1 className="text-3xl md:text-4xl font-bold">{node.name}</h1>
                <p className="text-lg md:text-xl mt-2 opacity-90">{node.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
              id="about"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre el Nodo</h2>
              <p className="text-gray-600 leading-relaxed">{node.description}</p>
            </motion.section>

            {/* Performance Stats */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
              id="performance"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rendimiento</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Bond Total</p>
                  <p className="text-xl font-semibold">{node.totalBond || '0'} RUNE</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="text-xl font-semibold">{node.uptime || '0'}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Slashing Events</p>
                  <p className="text-xl font-semibold">{node.slashingEvents || '0'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Edad</p>
                  <p className="text-xl font-semibold">{node.age || '0'} días</p>
                </div>
              </div>
            </motion.section>

            {/* Philosophy */}
            {node.philosophy && (
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6"
                id="philosophy"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Filosofía</h2>
                <div className="prose max-w-none">
                  {node.philosophy}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column - Contact & Social */}
          <div className="space-y-8">
            {/* Contact Form */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6"
              id="contact"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacto</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Enviar Mensaje
                </button>
              </form>
            </motion.section>

            {/* Social Links */}
            {node.socialLinks && (
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Redes Sociales</h2>
                <div className="space-y-4">
                  {node.socialLinks.twitter && (
                    <a
                      href={node.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span>Twitter</span>
                    </a>
                  )}
                  {node.socialLinks.telegram && (
                    <a
                      href={node.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      <span>Telegram</span>
                    </a>
                  )}
                  {node.socialLinks.discord && (
                    <a
                      href={node.socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      <span>Discord</span>
                    </a>
                  )}
                </div>
              </motion.section>
            )}

            {/* Bond Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="sticky top-4"
            >
              <button
                onClick={() => onRequestWhitelist(node)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                Hacer Bond
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NodeProfilePage; 