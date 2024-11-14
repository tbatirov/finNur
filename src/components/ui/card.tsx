import React from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  footer?: React.ReactNode;
}

export function Card({ 
  className,
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  footer,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {(title || Icon) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {Icon && <Icon className={cn('w-6 h-6', iconColor)} />}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">{children}</div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}