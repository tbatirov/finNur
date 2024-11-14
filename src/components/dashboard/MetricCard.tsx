import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export default function MetricCard({ title, value, change, icon: Icon, iconColor, iconBgColor }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${iconBgColor} rounded`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4 inline" />
          ) : (
            <ArrowDownRight className="w-4 h-4 inline" />
          )}
          {' '}{Math.abs(change)}%
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</p>
    </div>
  );
}