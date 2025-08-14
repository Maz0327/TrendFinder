import { storage } from '../storage';

export function startMomentsAggregator() {
  if (process.env.ENABLE_WORKERS !== 'true') {
    console.log('[moments-aggregator] Skipped (ENABLE_WORKERS not true)');
    return;
  }

  const run = async () => {
    try {
      const client = (storage as any).client;
      await client.query(`refresh materialized view concurrently public.moments_read_24h;`, []);
      console.log('[moments-aggregator] Refreshed moments_read_24h materialized view');
      // Optionally: roll-up to curated public.moments for 7d/30d windows
    } catch (err) {
      console.error('[moments-aggregator] error', err);
    }
  };

  console.log('[moments-aggregator] Starting with 2-minute intervals');
  // warm + every 2 minutes
  run();
  setInterval(run, 120000);
}