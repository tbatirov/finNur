import React, { useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GeneratedStatement } from '../types/financial';
import { calculateRatios } from '../utils/ratio-calculator';

interface Props {
  statement: GeneratedStatement;
  type: 'balance-sheet' | 'income' | 'cash-flow' | 'pnl';
}

interface RatioCardProps {
  name: string;
  value: number;
  description: string;
}

function RatioCard({ name, value, description }: RatioCardProps) {
  const isPercentage = name.toLowerCase().includes('margin') || 
                      name.toLowerCase().includes('ratio');
  const threshold = isPercentage ? 5 : 1;
  
  const getTrendIcon = () => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < -threshold) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
      <h4 className="text-sm font-medium text-gray-600">{name}</h4>
      <div className="flex items-center gap-2 my-2">
        <span className={`text-lg font-semibold ${value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {value.toFixed(2)}{isPercentage ? '%' : ''}
        </span>
        {getTrendIcon()}
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function FinancialRatios({ statement, type }: Props) {
  // Use useMemo to calculate ratios only when statement or type changes
  const ratios = useMemo(() => {
    if (!statement || !statement.lineItems || statement.lineItems.length === 0) {
      return [];
    }
    return calculateRatios(statement, type);
  }, [statement, type]);

  if (ratios.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Financial Ratios</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ratios.map((ratio, index) => (
          <RatioCard key={index} {...ratio} />
        ))}
      </div>
    </div>
  );
}