# FRONTEND CONTRACT (UI Integration Guide)

This doc defines how the new UI MUST integrate with the existing backend.

## 1) Environment & Config
- Use these env vars (Vite):
  - `VITE_SITE_URL` – absolute origin of the frontend (e.g., https://yourapp.tld)
  - `VITE_SUPABASE_URL` – Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` – Supabase anon key
- DO NOT hardcode URLs or keys. UI must read from env.

## 2) Auth Flow (Supabase)
- Use our initialized client: `import { supabase } from '@/integrations/supabase/client'`.
- Persist session + auto refresh are configured in that client. Do NOT create your own.
- Use `<AuthProvider>` and `useAuth()` (from `client/src/context/AuthContext.tsx`) as the only source of truth for auth state.
- OAuth redirect path: `${VITE_SITE_URL}/auth/callback` handled by `client/src/components/auth/AuthCallback.tsx`.
- Protect private routes via `client/src/components/auth/RequireAuth.tsx`.

## 3) Project Context
- Use `useProject()` from `client/src/context/ProjectContext.tsx` for the current project id.
- Do NOT invent your own project state via URL params. The provider is the contract.

## 4) Data Access Rules
- DO NOT call Supabase directly in pages or components.
- Only use our typed services in `client/src/services/*.ts` or the React Query hooks in `client/src/hooks/*`.
- All types MUST come from `@shared/database.types`.

## 5) Realtime
- If live updates are needed, use the helpers in `client/src/services/supabase-realtime.ts`.

## 6) Routing Shell
- Keep `/auth/callback` and `/login`.
- Mount all protected pages under `<RequireAuth>` in `client/src/App.tsx`.

## 7) Feature Flags
- Use `client/src/flags.ts` to gate Phase 5/6 pages. This avoids breaking current flows.

## 8) Styling Guardrails (Apple-inspired dark theme)
- Dark theme, high contrast, soft glass/translucency (backdrop-filter), subtle motion (hover/entrance).
- Components: rounded-2xl, gentle elevation, tasteful depth, generous spacing.
- Keep the UI elegant and calm; avoid heavy borders, loud colors, or clutter.

## 9) Do Not Change (Contract-critical)
- Function names and signatures exported from services and hooks.
- The Supabase client file path and its configuration.
- The `AuthProvider` / `ProjectProvider` contracts.
- Env variable names and their usage.

By following this contract, the UI can be redesigned without breaking the backend or data layer.