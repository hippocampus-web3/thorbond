import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { baseAmount } from "@xchainjs/xchain-util";
import { motion } from "framer-motion";
import Button from '../components/ui/Button';
import Tooltip from '../components/ui/Tooltip';
import { formatRune } from '../lib/utils';
import RuneBondEngine from '../lib/runebondEngine/runebondEngine';
import RoadmapSection from '../components/roadmap/RoadmapSection';

const HomePage: React.FC = () => {
  const [showFullProcess, setShowFullProcess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalBonded: formatRune(baseAmount(0)),
    completedWhitelists: 0,
    bondingAPY: '0'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const engine = RuneBondEngine.getInstance();
        const apiStats = await engine.getStats();
        
        setStats({
          totalNodes: apiStats.totalNodes,
          totalBonded: formatRune(baseAmount(apiStats.totalBondRune)),
          completedWhitelists: apiStats.completedWhitelists,
          bondingAPY: apiStats.networkStats.bondingAPY
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Earn yield with your RUNE — simple, transparent, real.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8"
            >
              Let your RUNE work for you.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/nodes">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Find a Node
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('bonding-steps')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn how it works
              </Button>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-8 text-xl text-blue-600 font-medium"
            >
              Bond your RUNE and earn up to{' '}
              <motion.span 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 1
                }}
                className="inline-block text-2xl font-bold"
              >
                {isLoading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  `${(parseFloat(stats.bondingAPY) * 100).toFixed(2)}%`
                )}
              </motion.span>
              {' '}APY
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Bond in 3 Steps Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        id="bonding-steps" 
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Bond in 3 Simple Steps
          </motion.h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-xl font-semibold text-gray-900">Find a Node</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Compare stats and choose the one you trust
              </p>
              <div className="flex items-center text-blue-600">
                <Link to="/nodes" className="text-sm font-medium">Compare node operators and choose one you trust</Link>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-xl font-semibold text-gray-900">Request to Whitelist</h3>
                <Tooltip content="Whitelisting is a security measure where node operators approve specific addresses before they can bond.">
                  <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-gray-600 mb-4">
                Submit your address and intended bond amount you want to bond
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-xl font-semibold text-gray-900">Bond your RUNE</h3>
                <Tooltip content="Bonding means locking your RUNE tokens to support a node's operations and earn rewards.">
                  <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-gray-600 mb-4">
                Sign the transaction to bond with your chosen Node Operator on THORChain
              </p>
            </motion.div>
          </motion.div>

          {/* Full Process Toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowFullProcess(!showFullProcess)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
            >
              {showFullProcess ? (
                <>
                  <ChevronUp className="h-5 w-5" />
                  Hide Full Process
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5" />
                  Show Full Process
                </>
              )}
            </button>
          </div>

          {/* Full Process Details */}
          {showFullProcess && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Bonding Process</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">1</div>
                  <span className="text-gray-600">Visit RUNEBond and browse available nodes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">2</div>
                  <span className="text-gray-600">Find a node that matches your preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">3</div>
                  <span className="text-gray-600">Connect your wallet to RUNEBond</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">4</div>
                  <span className="text-gray-600">Submit a whitelist request with your desired RUNE amount</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">5</div>
                  <span className="text-gray-600">Wait for the node operator to approve your request</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">6</div>
                  <span className="text-gray-600">Sign the bonding transaction when approved</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">7</div>
                  <span className="text-gray-600">Your RUNE is now bonded and earning rewards!</span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </motion.section>

      {/* Why Bond RUNE Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Why Bond RUNE?
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What is bonding?</h3>
              <p className="text-gray-600">
                Bonding is the process of locking your RUNE tokens to support a THORChain node's operations. 
                It's like staking, but specifically for THORChain's unique architecture.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How do I earn rewards?</h3>
              <p className="text-gray-600">
                You earn real-yield from fees collected by THORChain. The more RUNE you bond, 
                the more rewards you can earn, proportional to your share of the node's total bond.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Can I unbond?</h3>
              <p className="text-gray-600">
                Yes, but only when the Node Operator opens an unbonding window. There's no formal request — you can unbond your RUNE freely only during that time frame. 
                Outside of those windows, unbonding is not possible. This mechanism ensures the security and stability of the bonded node.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Are there risks?</h3>
              <p className="text-gray-600">
                The main risk is if a node misbehaves, it can be slashed, which means a portion of bonded RUNE 
                could be lost. That's why choosing a reliable node operator is crucial.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            RUNEBond Statistics
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={statsVariants} className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalNodes}
              </div>
              <div className="text-gray-600">
                Posted Nodes
              </div>
              <Tooltip content="Total number of nodes listed on RUNEBond">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help mx-auto mt-2" />
              </Tooltip>
            </motion.div>

            <motion.div variants={statsVariants} className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalBonded}
              </div>
              <div className="text-gray-600">
                Total RUNE Bonded
              </div>
              <Tooltip content="Total amount of RUNE bonded through RUNEBond">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help mx-auto mt-2" />
              </Tooltip>
            </motion.div>

            <motion.div variants={statsVariants} className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.completedWhitelists}
              </div>
              <div className="text-gray-600">
                Completed Whitelists
              </div>
              <Tooltip content="Total number of successful whitelist requests processed through RUNEBond">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help mx-auto mt-2" />
              </Tooltip>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Roadmap Section */}
      <RoadmapSection />

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 mb-6"
          >
            Ready to start bonding?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 mb-8"
          >
            Join thousands of RUNE holders supporting the THORChain network
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Link to="/nodes">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Find a Node to Bond With
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
