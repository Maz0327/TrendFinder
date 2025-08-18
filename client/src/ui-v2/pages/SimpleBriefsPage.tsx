import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';

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
        <div className="flex justify-center gap-4">
          <GlassCard className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
            <Plus className="w-5 h-5 text-ink" />
            <span className="text-ink font-medium">New Brief</span>
          </GlassCard>
          <GlassCard className="p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-ink/70" />
            <span className="text-ink/70">Search briefs...</span>
          </GlassCard>
        </div>

        {/* Placeholder content */}
        <div className="text-center py-12">
          <p className="text-ink/50">No briefs yet. Create your first strategic brief to get started.</p>
        </div>
      </div>
    </div>
  );
}