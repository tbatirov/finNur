import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Brain, AlertCircle } from 'lucide-react';
import { SavedStatement } from '../../types/financial';
import { useCompany } from '../../contexts/CompanyContext';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';

interface Props {
  statements: SavedStatement[];
}

export default function ComprehensiveReport({ statements }: Props) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<Array<{ title: string; content: string[] }>>([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedCompany } = useCompany();
  const aiAnalysis = useAIAnalysis();

  const handleAIAnalysis = async () => {
    setIsGeneratingAI(true);
    setError(null);

    try {
      const result = await aiAnalysis.mutateAsync({
        statements,
        industry: selectedCompany?.industry
      });
      setAiReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI analysis');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create HTML content with professional styling
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Financial Analysis Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .company-info {
            margin-bottom: 30px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
          }
          h1 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 10px;
          }
          h2 {
            color: #1e3a8a;
            font-size: 20px;
            margin-top: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
          }
          h3 {
            color: #2563eb;
            font-size: 16px;
            margin-top: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .analysis {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 12px;
            border: 1px solid #e5e7eb;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .amount {
            text-align: right;
            font-family: "Courier New", monospace;
          }
          .total-row {
            font-weight: bold;
            background-color: #f8fafc;
          }
          .statement-header {
            background-color: #1e40af;
            color: white;
            padding: 15px;
            margin-top: 40px;
          }
          .date-range {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FINANCIAL ANALYSIS REPORT</h1>
          <div class="date-range">For the period ending ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="company-info">
          <h2>${selectedCompany?.name || 'Company Name'}</h2>
          <p>Tax ID: ${selectedCompany?.tax_id || ''}</p>
          ${selectedCompany?.industry ? `<p>Industry: ${selectedCompany.industry}</p>` : ''}
        </div>

        <!-- Executive Summary and Analysis -->
        ${aiReport?.map(section => `
          <div class="section">
            <h2>${section.title}</h2>
            ${section.content.map(text => `<p>${text}</p>`).join('')}
          </div>
        `).join('') || '<p>No analysis available</p>'}

        <!-- Financial Statements -->
        ${statements.map(statement => `
          <div class="statement-header">
            <h2>${getStatementTitle(statement.type)}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Description</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${statement.statement.lineItems.map(item => `
                <tr>
                  <td>${item.code}</td>
                  <td>${item.description}</td>
                  <td class="amount">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              ${statement.statement.subtotals.map(subtotal => `
                <tr class="total-row">
                  <td colspan="2">${subtotal.description}</td>
                  <td class="amount">${formatCurrency(subtotal.amount)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td class="amount">${formatCurrency(statement.statement.total)}</td>
              </tr>
            </tbody>
          </table>
        `).join('')}

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>This report is generated automatically and should be reviewed by a qualified professional.</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCompany?.name || 'company'}-financial-analysis-report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Comprehensive Financial Report</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAIAnalysis}
            disabled={isGeneratingAI}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 rounded-lg disabled:opacity-50"
          >
            <Brain className={`w-4 h-4 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
            {isGeneratingAI ? 'Analyzing...' : 'AI Analysis'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {!statements.length ? (
        <div className="text-center text-gray-500 py-8">
          No statement data available for report generation
        </div>
      ) : (
        <div className="space-y-8">
          {aiReport.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{section.title}</h3>
              <div className="space-y-2 text-gray-600">
                {section.content.map((text, i) => (
                  <p key={i} className="whitespace-pre-line">{text}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to get statement title
const getStatementTitle = (type: string) => {
  switch (type) {
    case 'balance-sheet':
      return 'Balance Sheet';
    case 'income':
      return 'Income Statement';
    case 'cash-flow':
      return 'Cash Flow Statement';
    case 'pnl':
      return 'Profit & Loss Statement';
    default:
      return type;
  }
};