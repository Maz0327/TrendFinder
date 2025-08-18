import { motion } from 'framer-motion';
import { Plus, Search, FileText, TrendingUp, Users } from 'lucide-react';

export default function SimpleBriefsPage() {
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
            Strategic Briefs
          </h1>
          <p className="text-sm md:text-base text-ink/70 max-w-2xl mx-auto px-4 leading-relaxed">
            Create and manage your strategic intelligence briefs.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="frost-card p-4 flex items-center gap-3 cursor-pointer hover:frost-hover transition-all">
            <Plus className="w-5 h-5 text-ink" />
            <span className="text-ink font-medium">New Brief</span>
          </div>
          <div className="frost-card p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-ink/70" />
            <span className="text-ink/70">Search briefs...</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="frost-card p-6 text-center">
            <FileText className="w-8 h-8 text-ink mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-ink mb-2">Total Briefs</h3>
            <p className="text-2xl font-bold text-ink">12</p>
            <p className="text-sm text-ink/60 mt-1">+3 this week</p>
          </div>
          <div className="frost-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-ink mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-ink mb-2">Active Projects</h3>
            <p className="text-2xl font-bold text-ink">5</p>
            <p className="text-sm text-ink/60 mt-1">2 trending up</p>
          </div>
          <div className="frost-card p-6 text-center">
            <Users className="w-8 h-8 text-ink mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-ink mb-2">Team Members</h3>
            <p className="text-2xl font-bold text-ink">8</p>
            <p className="text-sm text-ink/60 mt-1">All active</p>
          </div>
        </div>

        {/* Recent Briefs */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-ink mb-6">Recent Strategic Briefs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Q4 Market Analysis", status: "Published", updated: "2 days ago" },
              { title: "Competitor Intelligence", status: "Draft", updated: "1 week ago" },
              { title: "Cultural Moments Report", status: "In Review", updated: "3 days ago" }
            ].map((brief, index) => (
              <motion.div
                key={index}
                className="frost-card p-6 cursor-pointer hover:frost-hover transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-ink mb-2">{brief.title}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    brief.status === 'Published' ? 'bg-green-100 text-green-800' :
                    brief.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {brief.status}
                  </span>
                  <span className="text-ink/60">{brief.updated}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}