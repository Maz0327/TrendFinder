# Content Radar (UI v2)

This is an isolated, Apple-inspired UI mounted at `/app-v2`, built with React + Vite + TypeScript + Tailwind + shadcn/ui.

## Enable the route
- Feature flag lives in `src/flags.ts` as `uiV2: true`.
- The route is mounted by the root app at `/app-v2/*`.

## Supabase client
- Reuses the existing env-based client: `client/src/lib/supabaseClient.ts` (imported via `content-radar/lib/supabase.ts`).
- Expects the following Vite env vars at runtime:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- In Lovable preview, envs are usually not present. The existing client includes a demo mode warning; for local development, set your env values.

## Types
- All types come from `@shared/database.types`. This project augments the schema with `dsd_briefs` and `cultural_moments` while keeping existing tables intact.

## Pages
- Captures Inbox: `/app-v2/captures-inbox`
- Moments Radar: `/app-v2/moments-radar`
- Brief Builder v2: `/app-v2/brief-builder-v2`
- Auth pages exist inside this module but only show if unauthenticated.

## Dev
- Install deps and run the app as usual.
- Ensure your `.env` (Vite) contains the two Supabase env vars above.
- Build should pass `tsc --noEmit` and `npm run build`.

## Notes
- This module avoids modifying existing routes and components; it can be promoted later once validated.
- Remove any demo fallbacks before production and verify RLS policies in Supabase for secure access.
