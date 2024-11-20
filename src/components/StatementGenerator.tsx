import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { StatementType, AccountEntry, GeneratedStatement } from '../types/financial';
import { generateFinancialStatement } from '../services/ai-provider';
import { API_CONFIG } from '../config/api';
import DraggableStatement from './DraggableStatement';
import StaticStatement from './StaticStatement';
import ValidationProgress from './ValidationProgress';
import StatementControls from './StatementControls';
import { RAGMonitor } from '../services/rag/monitor';

const VALIDATION_DURATION = 15000; // 15 seconds per statement
const VALIDATION_INTERVAL = 100; // Progress update interval
const STATEMENT_ORDER: StatementType[] = ['balance-sheet', 'income', 'cash-flow', 'pnl'];

interface Props {
  data: AccountEntry[];
  type: StatementType;
  onStatementGenerated: (type: StatementType, statement: GeneratedStatement) => void;
  isGenerating: boolean;
}

export default function StatementGenerator({ data, type, onStatementGenerated, isGenerating }: Props) {
  const [statement, setStatement] = useState<GeneratedStatement | null>(null);
  const [error, setError] = useState<{ message: string; details?: any } | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentValidatingType, setCurrentValidatingType] = useState<StatementType | null>(null);
  const [canSave, setCanSave] = useState(false);
  const ragMonitor = RAGMonitor.getInstance();

  // Validation sequence handler
  const startValidationSequence = useCallback((startType: StatementType) => {
    setCanSave(false);
    setIsValidating(true);
    setCurrentValidatingType(startType);
    setValidationProgress(0);

    const startTime = Date.now();
    const validationTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / VALIDATION_DURATION) * 100, 100);
      setValidationProgress(progress);

      if (progress >= 100) {
        clearInterval(validationTimer);
        const currentIndex = STATEMENT_ORDER.indexOf(startType);
        const nextIndex = currentIndex + 1;

        if (nextIndex < STATEMENT_ORDER.length) {
          // Start validating next statement after a short delay
          setTimeout(() => {
            startValidationSequence(STATEMENT_ORDER[nextIndex]);
          }, 1000);
        } else {
          // All statements validated
          setIsValidating(false);
          setCurrentValidatingType(null);
          setCanSave(true);
        }
      }
    }, VALIDATION_INTERVAL);

    return () => clearInterval(validationTimer);
  }, []);

  // Generate statement
  const generateStatement = useCallback(async (force = false) => {
    if (data.length === 0) return;
    
    setError(null);
    
    try {
      const result = await generateFinancialStatement(data, type, force);
      setStatement(result);
      onStatementGenerated(type, result);
      
      // Start validation sequence with first statement
      if (type === 'balance-sheet' && !isValidating) {
        startValidationSequence('balance-sheet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate statement';
      const errorDetails = err instanceof Error && 'details' in err ? (err as any).details : undefined;
      setError({ message: errorMessage, details: errorDetails });
    }
  }, [data, type, onStatementGenerated, startValidationSequence]);

  // Initial generation
  useEffect(() => {
    if (!API_CONFIG.openai.apiKey) {
      setError({
        message: 'OpenAI API key is not configured. Please add your API key to the environment variables.'
      });
      return;
    }

    if (data.length > 0) {
      generateStatement();
    }
  }, [data, generateStatement]);

  // Handle statement changes
  const handleStatementChange = useCallback((updatedStatement: GeneratedStatement) => {
    setStatement(updatedStatement);
    onStatementGenerated(type, updatedStatement);
  }, [type, onStatementGenerated]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {type === 'balance-sheet' && 'Balance Sheet'}
            {type === 'income' && 'Income Statement'}
            {type === 'cash-flow' && 'Cash Flow Statement'}
            {type === 'pnl' && 'Profit & Loss Statement'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {statement && (
            <button
              onClick={() => generateStatement(true)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {statement && (
        <StatementControls
          isDraggable={isDraggable}
          onDraggableChange={setIsDraggable}
          isAIEnabled={true}
          onAIEnabledChange={() => {}}
        />
      )}

      {isGenerating ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">
            {statement ? 'Regenerating statement...' : 'Generating statement...'}
          </span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Error</p>
          </div>
          <p className="text-red-600 mb-2">{error.message}</p>
          {error.details && (
            <details className="mt-2">
              <summary className="text-sm text-red-500 cursor-pointer hover:text-red-600">
                View error details
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 overflow-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ) : data.length > 0 && statement ? (
        <div className="space-y-6">
          {isValidating && (
            <ValidationProgress 
              progress={validationProgress} 
              currentType={currentValidatingType!}
              canSave={canSave}
            />
          )}
          {isDraggable ? (
            <DraggableStatement 
              statement={statement} 
              onStatementChange={handleStatementChange}
            />
          ) : (
            <StaticStatement statement={statement} />
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">Upload trial balance to generate statement</p>
      )}
    </div>
  );
}