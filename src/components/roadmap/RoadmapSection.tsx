import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  MessageSquare, 
  Trophy, 
  Rocket, 
  Sparkles, 
  Users,
  BarChart2,
  Zap,
  Globe,
  Lock,
  Bell,
  User
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import RuneBondEngine from '../../lib/runebondEngine/runebondEngine';
import { formatRune } from '../../lib/utils';
import { baseAmount } from '@xchainjs/xchain-util';

interface Milestone {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  details: string;
  requiredRune: number;
}

const milestones: Milestone[] = [
  {
    id: 'mvp',
    title: 'MVP',
    icon: <Rocket className="w-6 h-6" />,
    description: '✅ The basics, live and running',
    details: 'Node operators and bond providers can now connect, create listings, and bond on-chain. The foundation is set.',
    requiredRune: 0
  },
  {
    id: 'chat',
    title: 'Global Onchain Chat',
    icon: <MessageSquare className="w-6 h-6" />,
    description: '💬 Talk on-chain, in real time',
    details: 'A decentralized chat where node operators and bond providers connect directly. No middlemen, no noise.',
    requiredRune: 0
  },
  {
    id: 'performance',
    title: 'Performance Graphs',
    icon: <BarChart2 className="w-6 h-6" />,
    description: '📈 Transparency, visualized',
    details: 'Track node uptime, rewards, and bond activity. Clear, intuitive performance graphs.',
    requiredRune: 40000000000000 // 400,000 RUNE * 100,000,000
  },
  {
    id: 'notifications',
    title: 'Notification System',
    icon: <Bell className="w-6 h-6" />,
    description: '🔔 Stay in the loop',
    details: 'Real-time alerts for bond updates, approvals, and important events. No more missing out.',
    requiredRune: 50000000000000 // 500,000 RUNE * 100,000,000
  },
  {
    id: 'profiles',
    title: 'Node Operator Profiles',
    icon: <User className="w-6 h-6" />,
    description: '🧑‍🚀 Your node, your voice',
    details: 'Customizable profiles where operators can share their mission, values, contact info, or anything they want the community to know.',
    requiredRune: 60000000000000 // 600,000 RUNE * 100,000,000
  },
  {
    id: 'governance',
    title: 'Node Tools – Governance System',
    icon: <Users className="w-6 h-6" />,
    description: '🛠️ Decisions, powered by bonds',
    details: 'Bond providers will be able to vote on key upgrades and proposals, with voting power proportional to their bonded RUNE. Governance, straight from the chain.',
    requiredRune: 100000000000000 // 1M RUNE * 100,000,000
  },
  {
    id: 'reputation',
    title: 'Reputation System',
    icon: <Trophy className="w-6 h-6" />,
    description: '⭐ On-chain data, off-chain trust',
    details: 'A transparent scoring system that analyzes on-chain behavior to assess the risk profile of both Node Operators and Bond Providers. Because reputation should be earned, not claimed.',
    requiredRune: 200000000000000 // 2M RUNE * 100,000,000
  },
  {
    id: 'auto-approval',
    title: 'Node Tools – Auto-Approval',
    icon: <Zap className="w-6 h-6" />,
    description: '🤖 Less friction, more flow',
    details: 'Node operators will be able to auto-approve new bonders. Based on their custom rules.',
    requiredRune: 300000000000000 // 3M RUNE * 100,000,000
  },
  {
    id: 'community',
    title: 'Community Nodes',
    icon: <Globe className="w-6 h-6" />,
    description: '🌍 Run a node, as a tribe',
    details: 'Enabling decentralized, community-run nodes. Pooling bonds, voting rights, and responsibilities.',
    requiredRune: 500000000000000 // 5M RUNE * 100,000,000
  }
];

// Memoized Milestone component to prevent unnecessary re-renders
const MilestoneItem = React.memo(({ 
  milestone, 
  isActive, 
  currentRune 
}: { 
  milestone: Milestone; 
  isActive: boolean; 
  currentRune: number;
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const iconVariants = useMemo(() => ({
    active: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    inactive: {
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }), []);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }
  }, [handleMouseEnter, handleMouseLeave]);

  const progressPercentage = useMemo(() => 
    milestone.requiredRune > 0 
      ? ((currentRune / milestone.requiredRune) * 100).toFixed(1)
      : '0',
    [currentRune, milestone.requiredRune]
  );

  return (
    <div 
      ref={containerRef}
      className="relative"
    >
      <motion.div
        className="flex flex-col items-center p-4 md:p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 will-change-transform"
        whileHover={{ 
          scale: 1.02,
          zIndex: 10
        }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
      >
        <motion.div 
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4 will-change-transform relative
            ${isActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg shadow-blue-500/30' 
              : 'bg-gray-100'
            }`}
        >
          <motion.div 
            className={`${isActive ? 'text-white' : 'text-gray-400'}`}
            variants={iconVariants}
            animate={isActive ? "active" : "inactive"}
          >
            {milestone.icon}
          </motion.div>
          {isActive && (
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
          )}
        </motion.div>
        <div className="text-center">
          <h3 
            className={`text-base md:text-lg font-semibold mb-1 md:mb-2 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {milestone.title}
          </h3>
          <p 
            className={`text-xs md:text-sm mb-1 md:mb-2 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}
          >
            {milestone.description}
          </p>
          <div
            className={`text-xs md:text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
          >
            {milestone.requiredRune > 0 ? (
              <span className="flex items-center justify-center gap-1">
                <span className="font-bold">{formatRune(baseAmount(milestone.requiredRune))}</span>
                <span>RUNE</span>
              </span>
            ) : (
              <span className="text-blue-600">Unlocked</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Panel de detalles - Desktop */}
      <motion.div
        className="hidden md:block absolute top-0 left-full ml-4 w-80 bg-white rounded-xl shadow-lg z-20 overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          x: isHovered ? 0 : -20
        }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-800' 
                : 'bg-gray-100'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                {milestone.icon}
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1 rounded-full bg-blue-600" />
              <p className="text-sm text-gray-600">
                {milestone.details}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <div className="flex items-center gap-2">
                {!isActive && (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {isActive ? 'Active' : 'Locked'}
                </span>
              </div>
            </div>
            {milestone.requiredRune > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Required RUNE</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatRune(baseAmount(milestone.requiredRune))}
                  </span>
                  {!isActive && (
                    <span className="text-xs text-gray-400">
                      ({progressPercentage}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="md:hidden mt-4 bg-white rounded-xl shadow-sm overflow-hidden w-full">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-800' 
                : 'bg-gray-100'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                {milestone.icon}
              </div>
            </div>
            <h4 className="text-base font-semibold text-gray-900 break-words">{milestone.title}</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-1 rounded-full bg-blue-600 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed break-words">
                {milestone.details}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <div className="flex items-center gap-2">
                {!isActive && (
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {isActive ? 'Active' : 'Locked'}
                </span>
              </div>
            </div>
            {milestone.requiredRune > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Required RUNE</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatRune(baseAmount(milestone.requiredRune))}
                  </span>
                  {!isActive && (
                    <span className="text-xs text-gray-400">
                      ({progressPercentage}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MilestoneItem.displayName = 'MilestoneItem';

const RoadmapSection: React.FC = () => {
  const [stats, setStats] = React.useState({
    totalBonded: 0
  });

  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Handle scroll to anchor on initial load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#roadmap') {
      const element = document.getElementById('roadmap');
      if (element) {
        // Small delay to ensure content is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const currentRune = useMemo(() => stats.totalBonded, [stats.totalBonded]);
  const targetRune = useMemo(() => 500000000000000, []); // 5M RUNE * 100,000,000

  const progress = useMemo(() => 
    Math.min((currentRune / targetRune) * 100, 100), 
    [currentRune, targetRune]
  );

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }), []);

  const progressBarVariants = useMemo(() => ({
    hidden: { width: 0 },
    visible: {
      width: `${progress}%`,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  }), [progress]);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const engine = RuneBondEngine.getInstance();
        const apiStats = await engine.getStats();
        setStats({
          totalBonded: Number(apiStats.totalBondRune)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="roadmap" className="py-20 bg-gradient-to-b from-white to-blue-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            A roadmap for everyone, built by everyone
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 mb-4"
          >
            Our community roadmap isn't just a plan — it's a game.
          </motion.p>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 mb-4"
          >
            A fun way to keep the team inspired and the community active.
          </motion.p>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 mb-4"
          >
            Because nothing drives a team more than a community that enjoys, supports, and benefits from using the product.
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          variants={itemVariants}
          className="mb-16"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-900 font-medium">{formatRune(baseAmount(currentRune))} RUNE</span>
            <span className="text-gray-900 font-medium">{formatRune(baseAmount(targetRune))} RUNE</span>
          </div>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 will-change-transform"
              variants={progressBarVariants}
              initial="hidden"
              animate="visible"
            />
          </div>
        </motion.div>

        {/* Milestones Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {milestones.map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                isActive={currentRune >= milestone.requiredRune}
                currentRune={currentRune}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(RoadmapSection); 