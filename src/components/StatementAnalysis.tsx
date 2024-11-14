import React from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { GeneratedStatement } from '../types/financial';
import { calculateRatios } from '../utils/ratio-calculator';

interface Props {
  statement: GeneratedStatement;
  type: 'balance-sheet' | 'income' | 'cash-flow' | 'pnl';
}

export default function StatementAnalysis({ statement, type }: Props) {
  const getAnalysis = () => {
    const analysis = {
      insights: [] as string[],
      warnings: [] as string[],
      trends: [] as { label: string; trend: 'up' | 'down' | 'neutral'; value: number }[]
    };

    const ratios = calculateRatios(statement, type);

    switch (type) {
      case 'balance-sheet': {
        const currentRatio = ratios.find(r => r.name === 'Current Ratio')?.value || 0;
        const quickRatio = ratios.find(r => r.name === 'Quick Ratio')?.value || 0;
        const debtToEquity = ratios.find(r => r.name === 'Debt to Equity')?.value || 0;
        const workingCapitalRatio = ratios.find(r => r.name === 'Working Capital Ratio')?.value || 0;
        const debtRatio = ratios.find(r => r.name === 'Debt Ratio')?.value || 0;

        // Insights based on ratios
        analysis.insights.push(
          `Liquidity: Current ratio of ${currentRatio.toFixed(2)} indicates ${
            currentRatio > 2 ? 'strong' : currentRatio > 1 ? 'adequate' : 'weak'
          } short-term solvency`,
          `Quick ratio of ${quickRatio.toFixed(2)} shows ${
            quickRatio > 1 ? 'strong' : 'potential issues with'
          } immediate liquidity`,
          `Capital Structure: Debt-to-equity ratio of ${debtToEquity.toFixed(2)} indicates ${
            debtToEquity < 1 ? 'conservative' : debtToEquity < 2 ? 'moderate' : 'aggressive'
          } leverage`
        );

        // Trends based on ratio benchmarks
        analysis.trends.push(
          { 
            label: 'Working Capital',
            trend: workingCapitalRatio > 0.2 ? 'up' : workingCapitalRatio < 0.1 ? 'down' : 'neutral',
            value: workingCapitalRatio
          },
          {
            label: 'Debt Level',
            trend: debtRatio < 0.4 ? 'up' : debtRatio > 0.6 ? 'down' : 'neutral',
            value: debtRatio
          }
        );

        // Warnings based on ratio thresholds
        if (currentRatio < 1) {
          analysis.warnings.push('Current ratio below 1 indicates potential liquidity issues');
        }
        if (quickRatio < 0.5) {
          analysis.warnings.push('Low quick ratio suggests heavy reliance on inventory for liquidity');
        }
        if (debtToEquity > 2) {
          analysis.warnings.push('High debt-to-equity ratio indicates increased financial risk');
        }
        break;
      }

      case 'income': {
        const grossMargin = ratios.find(r => r.name === 'Gross Profit Margin')?.value || 0;
        const operatingMargin = ratios.find(r => r.name === 'Operating Margin')?.value || 0;
        const netMargin = ratios.find(r => r.name === 'Net Profit Margin')?.value || 0;
        const expenseRatio = ratios.find(r => r.name === 'Operating Expense Ratio')?.value || 0;

        analysis.insights.push(
          `Profitability: Gross margin of ${grossMargin.toFixed(2)}% indicates ${
            grossMargin > 40 ? 'strong' : grossMargin > 25 ? 'healthy' : 'thin'
          } pricing power`,
          `Operational Efficiency: Operating margin of ${operatingMargin.toFixed(2)}% shows ${
            operatingMargin > 15 ? 'efficient' : operatingMargin > 8 ? 'moderate' : 'inefficient'
          } operations`,
          `Bottom Line: Net margin of ${netMargin.toFixed(2)}% represents ${
            netMargin > 10 ? 'strong' : netMargin > 5 ? 'adequate' : 'weak'
          } overall profitability`
        );

        analysis.trends.push(
          {
            label: 'Profit Margins',
            trend: netMargin > 10 ? 'up' : netMargin < 5 ? 'down' : 'neutral',
            value: netMargin
          },
          {
            label: 'Cost Control',
            trend: expenseRatio < 50 ? 'up' : expenseRatio > 70 ? 'down' : 'neutral',
            value: expenseRatio
          }
        );

        if (grossMargin < 25) {
          analysis.warnings.push('Low gross margin may indicate pricing or cost issues');
        }
        if (operatingMargin < 8) {
          analysis.warnings.push('Low operating margin suggests operational inefficiencies');
        }
        break;
      }

      case 'cash-flow': {
        const operatingRatio = ratios.find(r => r.name === 'Operating Cash Flow Ratio')?.value || 0;
        const coverageRatio = ratios.find(r => r.name === 'Cash Flow Coverage Ratio')?.value || 0;
        const debtRatio = ratios.find(r => r.name === 'Cash Flow to Debt Ratio')?.value || 0;
        const investmentRatio = ratios.find(r => r.name === 'Investment to Operating Cash Flow')?.value || 0;

        analysis.insights.push(
          `Cash Generation: Operating cash flow ratio of ${operatingRatio.toFixed(2)} indicates ${
            operatingRatio > 1 ? 'strong' : 'weak'
          } cash generation`,
          `Investment Capacity: Coverage ratio of ${coverageRatio.toFixed(2)} shows ${
            coverageRatio > 1.5 ? 'strong' : coverageRatio > 1 ? 'adequate' : 'limited'
          } investment ability`,
          `Debt Service: Cash flow to debt ratio of ${debtRatio.toFixed(2)} indicates ${
            debtRatio > 0.2 ? 'comfortable' : 'tight'
          } debt service capacity`
        );

        analysis.trends.push(
          {
            label: 'Operating Cash',
            trend: operatingRatio > 1.2 ? 'up' : operatingRatio < 0.8 ? 'down' : 'neutral',
            value: operatingRatio
          },
          {
            label: 'Investment Level',
            trend: investmentRatio < 0.5 ? 'up' : investmentRatio > 0.8 ? 'down' : 'neutral',
            value: investmentRatio
          }
        );

        if (operatingRatio < 1) {
          analysis.warnings.push('Low operating cash flow ratio indicates potential cash flow issues');
        }
        if (coverageRatio < 1) {
          analysis.warnings.push('Low coverage ratio suggests difficulty funding investments');
        }
        break;
      }

      case 'pnl': {
        const grossMargin = ratios.find(r => r.name === 'Gross Margin')?.value || 0;
        const operatingMargin = ratios.find(r => r.name === 'Operating Margin')?.value || 0;
        const ebitdaMargin = ratios.find(r => r.name === 'EBITDA Margin')?.value || 0;
        const expenseRatio = ratios.find(r => r.name === 'Operating Expense Ratio')?.value || 0;

        analysis.insights.push(
          `Core Business: Gross margin of ${grossMargin.toFixed(2)}% shows ${
            grossMargin > 35 ? 'strong' : grossMargin > 20 ? 'adequate' : 'weak'
          } core profitability`,
          `Cost Structure: Operating expense ratio of ${expenseRatio.toFixed(2)}% indicates ${
            expenseRatio < 50 ? 'efficient' : expenseRatio < 70 ? 'moderate' : 'heavy'
          } cost structure`,
          `Cash Earnings: EBITDA margin of ${ebitdaMargin.toFixed(2)}% represents ${
            ebitdaMargin > 15 ? 'strong' : ebitdaMargin > 8 ? 'moderate' : 'weak'
          } cash earnings`
        );

        analysis.trends.push(
          {
            label: 'Operating Performance',
            trend: operatingMargin > 12 ? 'up' : operatingMargin < 6 ? 'down' : 'neutral',
            value: operatingMargin
          },
          {
            label: 'Cost Efficiency',
            trend: expenseRatio < 60 ? 'up' : expenseRatio > 80 ? 'down' : 'neutral',
            value: expenseRatio
          }
        );

        if (grossMargin < 20) {
          analysis.warnings.push('Low gross margin indicates potential pricing or cost issues');
        }
        if (ebitdaMargin < 8) {
          analysis.warnings.push('Low EBITDA margin suggests weak cash generation ability');
        }
        break;
      }
    }

    return analysis;
  };

  const analysis = getAnalysis();

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">AI Analysis</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Insights */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Key Insights</h4>
          <ul className="space-y-2">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-700">
                • {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Trends */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Key Metrics</h4>
          <ul className="space-y-2">
            {analysis.trends.map((trend, index) => (
              <li key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{trend.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{trend.value.toFixed(2)}</span>
                  {trend.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {trend.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <h4 className="text-sm font-medium text-yellow-800">Attention Required</h4>
          </div>
          <ul className="space-y-1">
            {analysis.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-700">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}