// scripts/seed.ts
import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '../client/src/types/supabase'

// --- env ---
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

// helpers
async function upsert<T extends keyof Database['public']['Tables']>(
  table: T,
  rows: Database['public']['Tables'][T]['Insert'][],
  onConflict?: string
) {
  const { data, error } = await supabase
    .from(table as string)
    .upsert(rows as any, { onConflict, ignoreDuplicates: false })
    .select()
  if (error) throw new Error(`[${String(table)}] upsert failed: ${error.message}`)
  return data
}

async function count(table: keyof Database['public']['Tables']) {
  const { count, error } = await supabase
    .from(table as string)
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

function nowISO() {
  return new Date().toISOString()
}

async function run() {
  const now = nowISO()

  // 1) users - minimal required fields
  const demoUserId = crypto.randomUUID()
  await upsert('users', [
    {
      id: demoUserId,
      email: 'strategist@example.com',
      password: 'hashed_password_placeholder',
      username: 'demo_strategist',
      role: 'admin'
    }
  ], 'id')

  // 2) captures - using actual database schema
  const projectId = crypto.randomUUID()
  await upsert('captures', [
    {
      project_id: projectId,
      user_id: demoUserId,
      type: 'manual',
      title: 'TikTok: "micro-treat errands" trend',
      content: 'Users reward errands with tiny treats; UGC POV + on-screen captions.',
      platform: 'tiktok',
      url: 'https://www.tiktok.com/@demo/video/123',
      tags: ['trend', 'ugc', 'pov'] as Json,
      truth_analysis: {
        hook: '"one more task → treat"',
        formats: ['POV', 'jump cuts'],
        notes: 'Leverage errand → reward framing'
      } as Json,
      dsd_tags: ['Define: Motivation', 'Deliver: 15s Reels'] as Json,
      dsd_section: 'define',
      viral_score: 76,
      viral_potential: 0.62,
      status: 'analyzed',
      created_at: now,
      updated_at: now
    },
    {
      project_id: projectId,
      user_id: demoUserId,
      type: 'manual',
      title: 'Reddit thread: budget energy drinks',
      content: 'Discussion about flavor vs. function; strong comments on price elasticity.',
      platform: 'reddit',
      url: 'https://reddit.com/r/energydrinks/comments/abc',
      tags: ['forums', 'price', 'category-insights'] as Json,
      truth_analysis: { drivers: ['value', 'taste'], risks: ['over-sweet'] } as Json,
      dsd_tags: ['Define: Value Sensitivity'] as Json,
      dsd_section: 'shift',
      viral_score: 41,
      viral_potential: 0.34,
      status: 'analyzed',
      created_at: now,
      updated_at: now
    }
  ])

  // 3) cultural_moments - using actual database schema
  await upsert('cultural_moments', [
    {
      moment_type: 'trend',
      description: 'Normalization of small self-rewards to push through chores.',
      emergence_date: now,
      peak_date: now,
      contributing_captures: [projectId] as Json,
      global_confidence: 0.7,
      cultural_context: {
        platforms: ['tiktok', 'instagram'],
        demographics: ['Gen Z', 'Young Millennial'],
        duration: 'short_term_surging'
      } as Json,
      strategic_implications: 'Micro-treat momentum represents a shift in self-permission psychology',
      status: 'emerging',
      created_at: now
    },
    {
      moment_type: 'discussion',
      description: 'Value-forward discourse around affordable energy drinks.',
      emergence_date: now,
      contributing_captures: [projectId] as Json,
      global_confidence: 0.5,
      cultural_context: {
        platforms: ['reddit', 'youtube'],
        demographics: ['Millennial', 'Blue Collar'],
        duration: 'medium_term'
      } as Json,
      strategic_implications: 'Budget energy conversations reveal price sensitivity patterns',
      status: 'monitoring',
      created_at: now
    }
  ])

  // 4) dsd_briefs - using actual database schema
  await upsert('dsd_briefs', [
    {
      project_id: projectId,
      title: 'Micro-Treat Launch Brief',
      status: 'draft',
      define_content: {
        audience_truths: [
          '"I need tiny wins to keep going."',
          'POV lo-fi content feels authentic.'
        ],
        cultural_context: 'Micro-treats as self-permission'
      } as Json,
      shift_content: {
        brand_shift: [
          'Reframe beverage as earned mini-reward for one more task.'
        ],
        strategic_levers: ['POV filming', 'on-screen captions']
      } as Json,
      deliver_content: {
        ideas: [
          '3x 15–20s scripts for Reels/TikTok',
          'Static meme format: "errand → treat" payoff'
        ],
        guardrails: ['Stay lo-fi; avoid overly polished look']
      } as Json,
      created_at: now,
      updated_at: now
    }
  ])

  // summary
  const [usersC, capturesC, momentsC, briefsC] = await Promise.all([
    count('users'),
    count('captures'),
    count('cultural_moments'),
    count('dsd_briefs')
  ])

  console.log('✅ Seed complete:', { users: usersC, captures: capturesC, cultural_moments: momentsC, dsd_briefs: briefsC })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})