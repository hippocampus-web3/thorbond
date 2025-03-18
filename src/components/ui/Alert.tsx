import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  className = '',
}) => {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      content: 'text-blue-700',
      Icon: Info,
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      content: 'text-green-700',
      Icon: CheckCircle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      content: 'text-yellow-700',
      Icon: AlertCircle,
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      content: 'text-red-700',
      Icon: XCircle,
    },
  };

  const { container, icon, title: titleStyle, content, Icon } = variantStyles[variant];

  return (
    <div className={`p-4 border rounded-md ${container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${icon}`} />
        </div>
        <div className="ml-3">
          {title && <h3 className={`text-sm font-medium ${titleStyle}`}>{title}</h3>}
          <div className={`text-sm ${content} ${title ? 'mt-2' : ''}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
