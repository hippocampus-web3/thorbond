import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  width?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  className = '',
  width = 'w-96',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 384;
      
      let left = rect.right - tooltipWidth;
      let top = rect.bottom + 8;

      if (left < 0) left = 0;
      if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth;
      }

      setCoords({
        top,
        left,
      });
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && createPortal(
        <div 
          ref={tooltipRef}
          className={`absolute ${width} bg-white shadow-lg rounded-lg p-4 z-[9999]`}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
          }}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip; 