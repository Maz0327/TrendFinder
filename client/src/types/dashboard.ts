export type DashboardStats = {
  totalTrends: number;
  viralPotential: number;
  activeSources: number;
  avgScore: number;
  // add any shared, agreed fields only here
};

export type IntelligenceSummary = {
  totalSignals: number;
  tier1Signals: number;
  tier2Signals: number;
  trends: number;
};

export type BrightDataStatus = {
  connected: boolean;
  platforms?: Record<string, any>;
};

export type Instructions = {
  steps?: string[];
};