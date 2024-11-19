interface IndustryInsight {
  benchmarks: {
    currentRatio: { min: number; target: number };
    quickRatio: { min: number; target: number };
    debtToEquity: { max: number; target: number };
    profitMargin: { min: number; target: number };
    assetTurnover: { min: number; target: number };
  };
  trends: string[];
  risks: string[];
  opportunities: string[];
}

export const INDUSTRY_INSIGHTS: Record<string, IndustryInsight> = {
  manufacturing: {
    benchmarks: {
      currentRatio: { min: 1.5, target: 2.0 },
      quickRatio: { min: 1.0, target: 1.5 },
      debtToEquity: { max: 2.0, target: 1.5 },
      profitMargin: { min: 8, target: 12 },
      assetTurnover: { min: 1.5, target: 2.0 }
    },
    trends: [
      'Increasing automation and robotics adoption',
      'Supply chain digitalization',
      'Sustainable manufacturing practices',
      'Industry 4.0 integration'
    ],
    risks: [
      'Raw material price volatility',
      'Supply chain disruptions',
      'Skilled labor shortages',
      'Regulatory compliance costs'
    ],
    opportunities: [
      'Smart factory implementation',
      'Green manufacturing initiatives',
      'Product customization capabilities',
      'Regional market expansion'
    ]
  },
  technology: {
    benchmarks: {
      currentRatio: { min: 2.0, target: 3.0 },
      quickRatio: { min: 1.5, target: 2.0 },
      debtToEquity: { max: 1.5, target: 1.0 },
      profitMargin: { min: 15, target: 20 },
      assetTurnover: { min: 1.0, target: 1.5 }
    },
    trends: [
      'AI and machine learning adoption',
      'Cloud computing growth',
      'Cybersecurity focus',
      'Remote work solutions'
    ],
    risks: [
      'Rapid technological obsolescence',
      'Cybersecurity threats',
      'Talent competition',
      'Regulatory changes'
    ],
    opportunities: [
      'Cloud service expansion',
      'AI/ML solutions development',
      'Digital transformation services',
      'Remote work technologies'
    ]
  },
  // Add more industries as needed
  default: {
    benchmarks: {
      currentRatio: { min: 1.5, target: 2.0 },
      quickRatio: { min: 1.0, target: 1.5 },
      debtToEquity: { max: 2.0, target: 1.5 },
      profitMargin: { min: 10, target: 15 },
      assetTurnover: { min: 1.0, target: 1.5 }
    },
    trends: [
      'Digital transformation',
      'Sustainability focus',
      'Customer experience enhancement',
      'Operational efficiency'
    ],
    risks: [
      'Market competition',
      'Economic uncertainty',
      'Regulatory changes',
      'Technology disruption'
    ],
    opportunities: [
      'Digital channel expansion',
      'Process automation',
      'Market diversification',
      'Innovation initiatives'
    ]
  }
};