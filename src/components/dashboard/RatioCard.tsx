import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Ratio } from '../../types/financial';

interface Props extends Ratio {}

export default function RatioCard({ name, value, description, benchmark, trend }: Props) {
  const isPercentage = name.toLowerCase().includes('margin') || 
                      name.toLowerCase().includes('ratio') ||
                      name.toLowerCase().includes('return');

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-gray-700">{name}</h5>
        {getTrendIcon()}
      </div>
      <p className="text-xl font-semibold text-gray-900 mb-1">
        {value.toFixed(2)}{isPercentage ? '%' : ''}
      </p>
      <p className="text-xs text-gray-500">{description}</p>
      {benchmark && (
        <p className="text-xs text-blue-600 mt-1">Target: {benchmark}</p>
      )}
    </div>
  );
}