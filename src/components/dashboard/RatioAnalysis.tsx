import React from 'react';
import { Calculator } from 'lucide-react';
import { SavedStatement } from '../../types/financial';
import RatioCategory from './RatioCategory';
import { useFinancialRatios } from '../../hooks/useFinancialRatios';

interface Props {
  statements: SavedStatement[];
  previousPeriodStatements?: SavedStatement[];
}

export default function RatioAnalysis({ statements, previousPeriodStatements }: Props) {
  const ratioCategories = useFinancialRatios(statements, previousPeriodStatements);

  if (!statements.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Financial Ratios</h3>
        </div>
        <p className="text-gray-500 text-center">No statements available for ratio analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Financial Ratios</h3>
      </div>

      <div className="space-y-8">
        {ratioCategories.map((category) => (
          <RatioCategory 
            key={category.name}
            name={category.name}
            ratios={category.ratios}
          />
        ))}
      </div>
    </div>
  );
}