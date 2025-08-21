import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  TrendingUp, 
  FileText, 
  Inbox, 
  Radar,
  Plus,
  ArrowRight,
  Zap
} from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
// import { useProjectContext } from '../app/providers';
import { useCaptures } from '../hooks/useCaptures';
import { useMoments } from '../hooks/useMoments';
import { useBriefs } from '../hooks/useBriefs';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const currentProjectId = null; // Default to showing all projects
  
  const capturesQuery = useCaptures({});
  const momentsHook = useMoments({ projectId: currentProjectId || undefined });
  const briefsHook = useBriefs({ projectId: currentProjectId || undefined });

  // Null-safety guards to prevent crashes - matching actual hook return types
  const captures = Array.isArray(capturesQuery?.data?.rows) ? capturesQuery.data.rows : [];
  const moments = Array.isArray(momentsHook?.moments) ? momentsHook.moments : [];
  const briefsData = briefsHook?.briefs;
  const briefs = Array.isArray(briefsData) ? briefsData : 
    briefsData && 'rows' in briefsData ? briefsData.rows : [];

  const stats = [
    {
      label: "Today's Captures",
      value: captures.filter((c: any) => {
        const today = new Date().toDateString();
        return new Date(c.createdAt).toDateString() === today;
      }).length,
      change: '+3 from yesterday',
      icon: Inbox,
      color: 'text-ink',
      bgColor: 'frost-card',
    },
    {
      label: 'Active Moments',
      value: moments.filter((m: any) => typeof m?.intensity === 'number' && m.intensity > 50).length,
      change: '2 trending up',
      icon: Radar,
      color: 'text-ink',
      bgColor: 'frost-strong',
    },
    {
      label: 'Draft Briefs',
      value: briefs.filter((b: any) => b.status === 'draft').length,
      change: 'Continue editing',
      icon: FileText,
      color: 'text-ink',
      bgColor: 'frost-subtle',
    },
    {
      label: 'Completion Rate',
      value: '87%',
      change: 'This week',
      icon: TrendingUp,
      color: 'text-ink',
      bgColor: 'frost-card',
    },
  ];

  const quickActions = [
    {
      title: 'New Brief',
      description: 'Start a fresh strategic brief',
      icon: Plus,
      action: () => setLocation('/briefs'),
      color: 'frost-strong',
    },
    {
      title: 'Review Captures',
      description: 'Triage your latest captures',
      icon: Inbox,
      action: () => setLocation('/captures'),
      color: 'frost-card',
    },
    {
      title: 'Explore Moments',
      description: 'Discover cultural trends',
      icon: Zap,
      action: () => setLocation('/moments'),
      color: 'frost-subtle',
    },
  ];

  const recentBriefs = Array.isArray(briefs) ? briefs.slice(0, 3).map((brief: any) => ({
    id: brief?.id || '',
    title: brief?.title || 'Untitled Brief',
    status: brief?.status || 'draft',
    slideCount: typeof brief?.slideCount === 'number' ? brief.slideCount : 0,
    updatedAt: brief?.updatedAt || new Date().toISOString(),
    tags: Array.isArray(brief?.tags) ? brief.tags : []
  })) : [];

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          className="text-center py-6 md:py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xl md:text-2xl font-semibold mb-3 text-ink">
            Dashboard Overview
          </h1>
          <p className="text-sm md:text-base text-ink/70 max-w-2xl mx-auto px-4 leading-relaxed">
            Monitor your content performance and track strategic insights across all projects.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                  <div className={`icon-container-sm md:icon-container rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4 stroke-1 text-lg md:text-xl ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg md:text-2xl font-bold leading-tight">{stat.value}</div>
                    <div className="text-xs md:text-sm text-ink/80 truncate font-medium">{stat.label}</div>
                    <div className="text-xs text-ink/60 mt-1 hidden md:block leading-relaxed">{stat.change}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-6 tracking-tight px-1 text-ink/90">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
              >
                <GlassCard hover>
                  <div className="cursor-pointer" onClick={action.action}>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`icon-container-sm md:icon-container rounded-xl ${action.color}`}>
                      <action.icon className="w-4 h-4 stroke-1 text-lg md:text-xl text-ink" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-semibold leading-tight">{action.title}</h3>
                      <p className="text-xs md:text-sm text-ink/70 leading-relaxed mt-1">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 stroke-1 text-ink/50 group-hover:text-ink/80 transition-colors" />
                  </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Briefs */}
        {recentBriefs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base md:text-lg font-semibold tracking-tight px-1 text-ink/90">Recent Briefs</h2>
              <button
                onClick={() => setLocation('/briefs')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-all duration-200 hover:underline"
              >
                View all →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {recentBriefs.map((brief: any, index: number) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <GlassCard hover>
                    <div className="cursor-pointer" onClick={() => setLocation(`/briefs/${brief.id}`)}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm md:text-base font-semibold line-clamp-2 leading-tight">{brief.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          brief.status === 'draft' 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : brief.status === 'in_review'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {brief.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-ink/70 leading-relaxed">
                        <span>{brief.slideCount} slides</span>
                        <span>•</span>
                        <span>{new Date(brief.updatedAt).toLocaleDateString()}</span>
                      </div>
                      
                      {brief.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {brief.tags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-white/10 rounded text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {brief.tags.length > 2 && (
                            <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium">
                              +{brief.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}