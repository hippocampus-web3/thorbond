import React from 'react';
import { Trophy, Sparkles, Eye, Shield, Lock, Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface NodeRestrictionNoticeProps {
  primaryState: string;
  stateStyles: {
    title: string;
    description: string;
  };
  node: any;
}

const NodeRestrictionNotice: React.FC<NodeRestrictionNoticeProps> = ({ primaryState, stateStyles, node }) => {
  return (
    <div className="flex items-center space-x-1 mt-2">
      {primaryState === 'full' ? (
        <>
          <Trophy className="h-4 w-4 text-emerald-600" />
          <Sparkles className="h-3 w-3 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">Full Capacity Node 🎉</span>
        </>
      ) : primaryState === 'hidden' ? (
        <>
          <Eye className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-600">Hidden Node</span>
        </>
      ) : (
        <>
          <Shield className="h-4 w-4 text-purple-600" />
          <Lock className="h-3 w-3 text-purple-500" />
          <span className="text-sm font-medium text-purple-600">Yield Guard Active ⚡</span>
        </>
      )}
      <Tooltip
        content={
          <div className="flex items-start gap-2">
            <Info className={`h-5 w-5 ${
              primaryState === 'full' ? 'text-emerald-600' : 
              primaryState === 'hidden' ? 'text-yellow-600' : 
              'text-purple-600'
            } flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {stateStyles.title}
              </h3>
              {primaryState === 'full' ? (
                <p className="text-sm text-gray-600">
                  {stateStyles.description}
                </p>
              ) : primaryState === 'hidden' ? (
                <>
                  {node.isHidden.reasons && node.isHidden.reasons.map((reason: string, index: number) => (
                    <p key={index} className="text-sm text-gray-600 mb-2">
                      • {reason}
                    </p>
                  ))}
                </>
              ) : (
                <>
                  {node.isYieldGuarded.reasons && node.isYieldGuarded.reasons.map((reason: string, index: number) => (
                    <p key={index} className="text-sm text-gray-600 mb-2">
                      • {reason}
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>
        }
      >
        <Info className={`h-4 w-4 ${
          primaryState === 'full' ? 'text-emerald-600' : 
          primaryState === 'hidden' ? 'text-yellow-600' : 
          'text-purple-600'
        } cursor-help`} />
      </Tooltip>
    </div>
  );
};

export default NodeRestrictionNotice; 