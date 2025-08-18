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
          <h1 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: '#0f172a' }}>
            Strategic Briefs
          </h1>
          <p className="text-sm md:text-base max-w-2xl mx-auto px-4 leading-relaxed" style={{ color: '#475569' }}>
            Create and manage your strategic intelligence briefs.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="p-4 flex items-center gap-3 cursor-pointer transition-all rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(15, 23, 42, 0.15)' }}>
            <Plus className="w-5 h-5" style={{ color: '#0f172a' }} />
            <span className="font-medium" style={{ color: '#0f172a' }}>New Brief</span>
          </div>
          <div className="p-4 flex items-center gap-3 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(15, 23, 42, 0.15)' }}>
            <Search className="w-5 h-5" style={{ color: '#475569' }} />
            <span style={{ color: '#475569' }}>Search briefs...</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 text-center rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(15, 23, 42, 0.15)' }}>
            <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: '#0f172a' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f172a' }}>Total Briefs</h3>
            <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>12</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>+3 this week</p>
          </div>
          <div className="p-6 text-center rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(15, 23, 42, 0.15)' }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: '#0f172a' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f172a' }}>Active Projects</h3>
            <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>5</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>2 trending up</p>
          </div>
          <div className="p-6 text-center rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(15, 23, 42, 0.15)' }}>
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: '#0f172a' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f172a' }}>Team Members</h3>
            <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>8</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>All active</p>
          </div>
        </div>

        {/* Recent Briefs */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#0f172a' }}>Recent Strategic Briefs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Q4 Market Analysis", status: "Published", updated: "2 days ago" },
              { title: "Competitor Intelligence", status: "Draft", updated: "1 week ago" },
              { title: "Cultural Moments Report", status: "In Review", updated: "3 days ago" }
            ].map((brief, index) => (
              <motion.div
                key={index}
                className="p-6 cursor-pointer transition-all rounded-2xl"
                style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(15, 23, 42, 0.15)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#0f172a' }}>{brief.title}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    brief.status === 'Published' ? 'bg-green-100 text-green-800' :
                    brief.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {brief.status}
                  </span>
                  <span style={{ color: '#64748b' }}>{brief.updated}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}