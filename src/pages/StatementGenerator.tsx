import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, Save } from 'lucide-react';
import TrialBalanceInput from '../components/TrialBalanceInput';
import StatementGenerator from '../components/StatementGenerator';
import Navigation from '../components/Navigation';
import { AccountEntry, StatementType, GeneratedStatement } from '../types/financial';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SaveStatementsDialog from '../components/SaveStatementsDialog';

export default function StatementGeneratorPage() {
  const [trialBalanceData, setTrialBalanceData] = useState<AccountEntry[]>([]);
  const [activeStatement, setActiveStatement] = useState<StatementType>('balance-sheet');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStatements, setGeneratedStatements] = useState<Record<StatementType, GeneratedStatement>>({});

  const handleDataUpload = useCallback((data: AccountEntry[]) => {
    setTrialBalanceData(data);
    setGeneratedStatements({});
    setIsGenerating(true);
  }, []);

  const handleStatementGenerated = useCallback((type: StatementType, statement: GeneratedStatement) => {
    setGeneratedStatements(prev => ({
      ...prev,
      [type]: statement
    }));
    setIsGenerating(false);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    setIsSaveDialogOpen(false);
  }, []);

  // Check if all statement types have been generated
  const allStatementsGenerated = ['balance-sheet', 'income', 'cash-flow', 'pnl'].every(
    type => generatedStatements[type as StatementType]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Statements</h1>
            <p className="text-sm text-gray-500">Generate and manage your financial statements</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4">
          <ErrorBoundary>
            <TrialBalanceInput onDataUpload={handleDataUpload} />
          </ErrorBoundary>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 justify-between">
              <Navigation 
                activeStatement={activeStatement}
                onStatementChange={setActiveStatement}
              />
              {trialBalanceData.length > 0 && (
                <button
                  onClick={() => setIsSaveDialogOpen(true)}
                  disabled={!allStatementsGenerated || isGenerating}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white font-medium hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save All Statements
                </button>
              )}
            </div>
            
            <ErrorBoundary>
              <StatementGenerator
                data={trialBalanceData}
                type={activeStatement}
                onStatementGenerated={handleStatementGenerated}
                isGenerating={isGenerating}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {isSaveDialogOpen && (
        <SaveStatementsDialog
          statements={generatedStatements}
          onClose={() => setIsSaveDialogOpen(false)}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}