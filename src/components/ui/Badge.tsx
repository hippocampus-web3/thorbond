import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  link?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  link,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const styleHover = 'hover:underline hover:cursor-pointer'

  return (
    <span
      onClick={() => link && window.open(link, '_blank')}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className} ${link ? styleHover : ''}`}
    >
      {children}
    </span>
  );
};

export default Badge;
