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
  position = 'bottom',
  className = '',
  width = 'w-96',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 384; // w-96 = 24rem = 384px
      
      // Calculate position relative to viewport
      let left = rect.right - tooltipWidth;
      let top = rect.bottom + 8;

      // Ensure tooltip stays within viewport
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

  return (
    <div 
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
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
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip; 