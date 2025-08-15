import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IS_MOCK_MODE } from '../services/http';
import { User } from '../types';

const mockUser: User = {
  id: 'user-1',
  email: 'strategist@example.com',
  name: 'Alex Chen',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
};
export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (IS_MOCK_MODE) {
        return mockUser;
      }
      // Real auth service call to our backend
      try {
        const response = await fetch('/api/auth/user', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          return userData;
        }
        return null;
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      if (!IS_MOCK_MODE) {
        // Real sign out would go here
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
    getSignInUrl: () => '/api/auth/google/start',
  };
}