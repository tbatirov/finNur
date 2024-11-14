import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Play } from 'lucide-react';
import { read, utils } from 'xlsx';
import { AccountEntry } from '../types/financial';

interface Props {
  onDataUpload: (data: AccountEntry[]) => void;
}

export default function TrialBalanceInput({ onDataUpload }: Props) {
  const [uploadedData, setUploadedData] = useState<AccountEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const processedData = jsonData.slice(1)
        .filter(row => row.some(cell => cell != null))
        .map(row => ({
          accountCode: row[0]?.toString().trim() || '',
          accountName: row[1]?.toString().trim() || '',
          openingBalanceDebit: parseFloat(row[2]) || 0,
          openingBalanceCredit: parseFloat(row[3]) || 0,
          currentTurnoverDebit: parseFloat(row[4]) || 0,
          currentTurnoverCredit: parseFloat(row[5]) || 0,
          endOfPeriodDebit: parseFloat(row[6]) || 0,
          endOfPeriodCredit: parseFloat(row[7]) || 0
        }));

      setUploadedData(processedData);
      event.target.value = '';
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process Excel file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    if (uploadedData.length > 0) {
      onDataUpload(uploadedData);
    }
  }, [uploadedData, onDataUpload]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg">
      <div className="px-6 pt-6 pb-1">
        <div className="flex flex-col items-center gap-4">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Upload Trial Balance</h3>
        </div>
      </div>
    
      <div className="p-6">
        {uploadedData.length === 0 ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50/50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">Click to upload Excel file</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
            />
          </label>
        ) : (
          <p className="text-sm text-gray-500 text-center">{uploadedData.length} rows uploaded</p>
        )}

        {uploadedData.length > 0 && (
          <button
            onClick={handleGenerate}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            Generate Statements
          </button>
        )}
      </div>
    </div>
  );
}