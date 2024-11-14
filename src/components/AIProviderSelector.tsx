import React, { useEffect, useState } from 'react';
import { Bot, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
import { AIProvider } from '../services/ai-provider';
import { checkAIConnection } from '../services/connection-checker';

interface Props {
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

export default function AIProviderSelector({ provider, onProviderChange, disabled }: Props) {
  const [openAIStatus, setOpenAIStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [anthropicStatus, setAnthropicStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    async function checkConnections() {
      // Check OpenAI
      const openAIResult = await checkAIConnection('openai');
      setOpenAIStatus(openAIResult ? 'connected' : 'error');

      // Check Anthropic
      const anthropicResult = await checkAIConnection('anthropic');
      setAnthropicStatus(anthropicResult ? 'connected' : 'error');
    }

    checkConnections();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => onProviderChange('openai')}
          disabled={disabled || openAIStatus === 'error'}
          className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg transition ${
            provider === 'openai'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'hover:bg-gray-50 text-gray-600'
          } ${(disabled || openAIStatus === 'error') ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span>OpenAI</span>
          </div>
          <div className="flex items-center">
            {openAIStatus === 'checking' ? (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            ) : openAIStatus === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </button>

        <button
          onClick={() => onProviderChange('anthropic')}
          disabled={disabled || anthropicStatus === 'error'}
          className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg transition ${
            provider === 'anthropic'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'hover:bg-gray-50 text-gray-600'
          } ${(disabled || anthropicStatus === 'error') ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" />
            <span>Anthropic</span>
          </div>
          <div className="flex items-center">
            {anthropicStatus === 'checking' ? (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            ) : anthropicStatus === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </button>
      </div>

      {(openAIStatus === 'error' || anthropicStatus === 'error') && (
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">
            {openAIStatus === 'error' && anthropicStatus === 'error' ? (
              'Both AI providers are unavailable. Please check your API keys and connection.'
            ) : openAIStatus === 'error' ? (
              'OpenAI is unavailable. Please check your API key and connection.'
            ) : (
              'Anthropic is unavailable. Please check your API key and connection.'
            )}
          </p>
        </div>
      )}
    </div>
  );
}