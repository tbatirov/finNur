import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

type RAGStatus = 'red' | 'amber' | 'green';

interface Props {
  status: RAGStatus;
  message: string;
  details?: string[];
}

const statusConfig = {
  red: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  amber: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  green: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
};

export default function RAGIndicator({ status, message, details }: Props) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-4 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <p className={`font-medium ${config.color}`}>{message}</p>
      </div>
      {details && details.length > 0 && (
        <ul className={`mt-2 ml-7 text-sm ${config.color} space-y-1`}>
          {details.map((detail, index) => (
            <li key={index} className="list-disc">{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}