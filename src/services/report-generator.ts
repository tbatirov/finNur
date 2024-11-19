import { SavedStatement } from '../types/financial';
import { INDUSTRY_INSIGHTS } from '../utils/industry-insights';

export async function generateIndustryReport(
  statements: SavedStatement[],
  industry: string
): Promise<string[]> {
  const insights = INDUSTRY_INSIGHTS[industry] || INDUSTRY_INSIGHTS.default;
  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  const incomeStatement = statements.find(s => s.type === 'income')?.statement;

  if (!balanceSheet || !incomeStatement) {
    return ['Insufficient data for industry analysis'];
  }

  // Calculate key metrics for comparison
  const currentRatio = calculateCurrentRatio(balanceSheet);
  const profitMargin = calculateProfitMargin(incomeStatement);

  const report: string[] = [];

  // Industry-specific benchmarking
  report.push('Industry Benchmarking:');
  report.push(`• Current Ratio: ${currentRatio.toFixed(2)} (Industry target: ${insights.benchmarks.currentRatio.target})`);
  report.push(`• Profit Margin: ${profitMargin.toFixed(1)}% (Industry target: ${insights.benchmarks.profitMargin.target}%)`);
  report.push('');

  // Industry trends analysis
  report.push('Industry Trends:');
  insights.trends.forEach(trend => report.push(`• ${trend}`));
  report.push('');

  // Risk assessment
  report.push('Industry-Specific Risks:');
  insights.risks.forEach(risk => report.push(`• ${risk}`));
  report.push('');

  // Opportunities
  report.push('Growth Opportunities:');
  insights.opportunities.forEach(opportunity => report.push(`• ${opportunity}`));

  return report;
}

function calculateCurrentRatio(balanceSheet: any): number {
  const currentAssets = balanceSheet.lineItems
    .filter((item: any) => item.section.toString().toLowerCase().includes('current_assets'))
    .reduce((sum: number, item: any) => sum + item.amount, 0);

  const currentLiabilities = balanceSheet.lineItems
    .filter((item: any) => item.section.toString().toLowerCase().includes('current_liabilities'))
    .reduce((sum: number, item: any) => sum + Math.abs(item.amount), 0);

  return currentLiabilities === 0 ? 0 : currentAssets / currentLiabilities;
}

function calculateProfitMargin(incomeStatement: any): number {
  const revenue = incomeStatement.lineItems
    .filter((item: any) => item.section.toString().toLowerCase().includes('revenue'))
    .reduce((sum: number, item: any) => sum + Math.abs(item.amount), 0);

  const netIncome = incomeStatement.total || 0;

  return revenue === 0 ? 0 : (netIncome / revenue) * 100;
}