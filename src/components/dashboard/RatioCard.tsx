import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  name: string;
  value: number;
  previousValue: number;
  description: string;
  isPercentage?: boolean;
}

export default function RatioCard({ name, value, previousValue, description, isPercentage = false }: Props) {
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const formattedValue = isPercentage ? `${value.toFixed(2)}%` : value.toFixed(2);

  const getTrendIcon = () => {
    if (Math.abs(change) < 1) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{name}</h4>
        {getTrendIcon()}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-2">{formattedValue}</p>
      <p className="text-xs text-gray-500">{description}</p>
      {Math.abs(change) >= 1 && (
        <p className={`text-xs mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs previous
        </p>
      )}
    </div>
  );
}