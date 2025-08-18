import React, { useState, useEffect } from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { TruthTabs } from '../components/truth/TruthTabs';
import { TruthResultCard } from '../components/truth/TruthResultCard';
import { listTruthChecks } from '../services/truth';
import { Link, useLocation } from 'wouter';

export function TruthLabPage() {
  const [, navigate] = useLocation();
  const [recentChecks, setRecentChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentChecks();
  }, []);

  const loadRecentChecks = async () => {
    try {
      const result = await listTruthChecks({ page: 1, pageSize: 6 }) as any;
      setRecentChecks(result.data || []);
    } catch (error) {
      console.error('Failed to load recent checks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisStart = (result: any) => {
    console.log('Analysis started:', result);
    // Refresh the recent checks list
    loadRecentChecks();
  };

  return (
    <div className="min-h-screen frost-subtle">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="frost-subtle p-2 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Truth Lab
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze URLs, text content, and images for truth and credibility verification
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Panel */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Start New Analysis
              </h2>
              <TruthTabs onAnalysisStart={handleAnalysisStart} />
            </div>

            {/* Quick Stats */}
            <div className="frost-card p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Analysis Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="frost-subtle p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Average Analysis Time
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ~30 seconds per check
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="frost-subtle p-2 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Accuracy Rate
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      95%+ verification accuracy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recent Analyses
              </h2>
              <Link 
                href="/truth-lab/history"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                data-testid="view-all-analyses"
              >
                View All →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="frost-card p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentChecks.length > 0 ? (
              <div className="space-y-4">
                {recentChecks.map((check: any) => (
                  <TruthResultCard
                    key={check.id}
                    truthCheck={check}
                    onClick={() => {
                      // Navigate to detail page using wouter
                      navigate(`/truth-lab/${check.id}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="frost-card p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Analyses Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start your first truth analysis using the panel on the left.
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/projects"
                  className="frost-card hover:frost-strong p-3 text-sm transition-all"
                  data-testid="projects-link"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Analyze Project Files
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Run truth checks on uploaded captures
                  </p>
                </Link>
                
                <Link
                  href="/chrome-extension"
                  className="frost-card hover:frost-strong p-3 text-sm transition-all"
                  data-testid="extension-link"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Browser Extension
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Install for instant fact-checking
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}