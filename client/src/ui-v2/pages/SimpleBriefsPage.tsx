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
          <h1 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: '#ffffff' }}>
            Strategic Briefs
          </h1>
          <p className="text-sm md:text-base max-w-2xl mx-auto px-4 leading-relaxed" style={{ color: '#e2e8f0' }}>
            Create and manage your strategic intelligence briefs.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="p-4 flex items-center gap-3 cursor-pointer transition-all rounded-2xl hover:bg-white/30" style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
            <span className="font-medium" style={{ color: '#ffffff' }}>New Brief</span>
          </div>
          <div className="p-4 flex items-center gap-3 rounded-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Search className="w-5 h-5" style={{ color: '#e2e8f0' }} />
            <span style={{ color: '#e2e8f0' }}>Search briefs...</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 text-center rounded-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.25)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: '#ffffff' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Total Briefs</h3>
            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>12</p>
            <p className="text-sm mt-1" style={{ color: '#e2e8f0' }}>+3 this week</p>
          </div>
          <div className="p-6 text-center rounded-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.25)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: '#ffffff' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Active Projects</h3>
            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>5</p>
            <p className="text-sm mt-1" style={{ color: '#e2e8f0' }}>2 trending up</p>
          </div>
          <div className="p-6 text-center rounded-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.25)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: '#ffffff' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Team Members</h3>
            <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>8</p>
            <p className="text-sm mt-1" style={{ color: '#e2e8f0' }}>All active</p>
          </div>
        </div>

        {/* Recent Briefs */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#ffffff' }}>Recent Strategic Briefs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Q4 Market Analysis", status: "Published", updated: "2 days ago" },
              { title: "Competitor Intelligence", status: "Draft", updated: "1 week ago" },
              { title: "Cultural Moments Report", status: "In Review", updated: "3 days ago" }
            ].map((brief, index) => (
              <motion.div
                key={index}
                className="p-6 cursor-pointer transition-all rounded-2xl"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  backdropFilter: 'blur(20px)', 
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02, background: 'rgba(255, 255, 255, 0.3)' }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{brief.title}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    brief.status === 'Published' ? 'bg-green-500/30 text-green-100 border border-green-400/50' :
                    brief.status === 'Draft' ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-400/50' :
                    'bg-blue-500/30 text-blue-100 border border-blue-400/50'
                  }`}>
                    {brief.status}
                  </span>
                  <span style={{ color: '#e2e8f0' }}>{brief.updated}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}