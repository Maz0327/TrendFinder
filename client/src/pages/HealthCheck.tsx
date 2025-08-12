import { getSiteUrl } from '@/lib/siteUrl';

export default function HealthCheck() {
  const siteUrl = getSiteUrl();
  const callbackUrl = `${siteUrl}/auth/callback`;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Configuration Health Check</h1>
      
      <div className="space-y-4">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Site URL</h3>
          <code className="text-sm bg-zinc-900 px-2 py-1 rounded">{siteUrl}</code>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">OAuth Callback URL</h3>
          <code className="text-sm bg-zinc-900 px-2 py-1 rounded">{callbackUrl}</code>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Variables</h3>
          <div className="text-sm space-y-1">
            <div>VITE_SITE_URL: {import.meta.env.VITE_SITE_URL || '<not set>'}</div>
            <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
            <div>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
          </div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-300">Next Steps</h3>
          <p className="text-sm text-blue-200">
            Make sure both URLs above are configured in:
            <br />• Supabase Dashboard → Auth → Providers → Google → Authorized redirect URIs
            <br />• Google Cloud Console → OAuth 2.0 client → Authorized redirect URIs
          </p>
        </div>
      </div>
    </div>
  );
}