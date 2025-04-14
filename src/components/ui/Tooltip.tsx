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

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 384, // 384px es el ancho de w-96 (96 * 4)
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
          className={`fixed ${width} bg-white shadow-lg rounded-lg p-4 z-[9999]`}
          style={{
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