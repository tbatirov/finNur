import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SavedStatement } from '../types/financial';
import { generateAIAnalysis } from '../services/openai';
import { calculateMetrics, generateAnalysis } from '../services/report-analysis';

interface AIAnalysisInput {
  statements: SavedStatement[];
  industry?: string;
}

interface AIAnalysisResult {
  title: string;
  content: string[];
}

export function useAIAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['aiAnalysis'],
    mutationFn: async ({ statements, industry }: AIAnalysisInput) => {
      const metrics = calculateMetrics(statements);
      const aiInsights = await generateAIAnalysis(statements, metrics, industry);
      const analysis = generateAnalysis(statements, metrics);

      return [
        {
          title: 'Executive Summary',
          content: aiInsights.slice(0, 3)
        },
        {
          title: 'Key Strengths',
          content: analysis.strengths
        },
        {
          title: 'Areas for Improvement',
          content: analysis.improvements
        },
        {
          title: 'Risk Assessment',
          content: analysis.risks
        },
        {
          title: 'Strategic Recommendations',
          content: analysis.recommendations
        },
        {
          title: 'Industry Analysis',
          content: aiInsights.slice(3)
        }
      ] as AIAnalysisResult[];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['aiAnalysis'], data);
    }
  });
}