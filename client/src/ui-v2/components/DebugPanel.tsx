import { IS_MOCK_MODE } from '../services/http';
import { useAuth } from '../hooks/useAuth';

export function DebugPanel() {
  const { user, loading } = useAuth();
  
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded z-50 text-xs font-mono">
      <div>IS_MOCK_MODE: {String(IS_MOCK_MODE)}</div>
      <div>hostname: {window.location.hostname}</div>
      <div>loading: {String(loading)}</div>
      <div>user: {user ? JSON.stringify(user) : 'null'}</div>
      <div>env VITE_UIV2_MOCK: {import.meta.env.VITE_UIV2_MOCK || 'undefined'}</div>
    </div>
  );
}