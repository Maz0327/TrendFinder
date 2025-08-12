# UI Handoff Pack — How to Use

## What this pack includes
- Typed DB shapes: `shared/database.types.ts`
- Supabase client (preconfigured)
- Auth + Project contexts
- Services + Hooks (typed, the only data access points)
- Shell (`App.tsx`, `main.tsx`), flags, and sample pages
- Env example
- (Optional) schema.sql if present in repo

## How to integrate
1. Drop these folders into your UI codebase, preserving relative import paths:
   - `shared/`
   - `client/src/integrations/supabase/`
   - `client/src/context/`
   - `client/src/components/auth/`
   - `client/src/services/`
   - `client/src/hooks/`
   - `client/src/` (only the provided files)
2. Ensure the bundler resolves `@/` to `client/src` and `@shared` to `/shared`.
3. Set env variables from `.env.example`.
4. Build pages ONLY via hooks/services; do not talk to Supabase directly.
5. Keep `/auth/callback` and mount protected routes under `<RequireAuth>`.

Follow `FRONTEND_CONTRACT.md` strictly to avoid breaking integration.