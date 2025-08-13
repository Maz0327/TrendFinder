import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Plus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ExtensionToken {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

export function Settings() {
  const [newTokenName, setNewTokenName] = useState('');
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch extension tokens
  const { data: tokensData, isLoading } = useQuery<{ tokens: ExtensionToken[] }>({
    queryKey: ['/api/extension/tokens'],
    retry: false,
  });

  // Create new token mutation
  const createTokenMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('/api/extension/tokens', {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Extension Token Created',
        description: 'Copy the token below - it won\'t be shown again.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/extension/tokens'] });
      setNewTokenName('');
      setShowTokens(prev => ({ ...prev, [data.token]: true }));
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create extension token',
        variant: 'destructive',
      });
    },
  });

  // Revoke token mutation
  const revokeTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      return apiRequest(`/api/extension/tokens/${tokenId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Token Revoked',
        description: 'Extension token has been revoked successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/extension/tokens'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke token',
        variant: 'destructive',
      });
    },
  });

  const handleCreateToken = () => {
    if (!newTokenName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a token name',
        variant: 'destructive',
      });
      return;
    }
    createTokenMutation.mutate(newTokenName);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: 'Copied',
      description: 'Extension token copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="extensions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="extensions">Chrome Extension</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="extensions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chrome Extension Integration</CardTitle>
              <CardDescription>
                Create and manage API tokens for the Content Radar Chrome Extension. 
                These tokens allow the extension to securely capture content and send it to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Create New Token Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create New Extension Token</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter token name (e.g., 'Personal MacBook')"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="flex-1"
                    data-testid="input-token-name"
                  />
                  <Button 
                    onClick={handleCreateToken}
                    disabled={createTokenMutation.isPending}
                    data-testid="button-create-token"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createTokenMutation.isPending ? 'Creating...' : 'Create Token'}
                  </Button>
                </div>
              </div>

              {/* Show newly created token */}
              {createTokenMutation.data?.token && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-yellow-800">⚠️ Save Your Token</h4>
                      <p className="text-sm text-yellow-700">
                        Copy this token now - it won't be displayed again for security reasons.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={createTokenMutation.data.token}
                          readOnly
                          type={showTokens[createTokenMutation.data.token] ? 'text' : 'password'}
                          className="font-mono text-sm"
                          data-testid="input-new-token"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTokens(prev => ({ 
                            ...prev, 
                            [createTokenMutation.data.token]: !prev[createTokenMutation.data.token] 
                          }))}
                          data-testid="button-toggle-token-visibility"
                        >
                          {showTokens[createTokenMutation.data.token] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyToken(createTokenMutation.data.token)}
                          data-testid="button-copy-token"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Tokens List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Extension Tokens</h3>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading tokens...</div>
                ) : tokensData?.tokens && tokensData.tokens.length > 0 ? (
                  <div className="space-y-3">
                    {tokensData.tokens.map((token) => (
                      <Card key={token.id} className={token.revoked ? 'opacity-50' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium" data-testid={`text-token-name-${token.id}`}>
                                  {token.name}
                                </span>
                                {token.revoked ? (
                                  <Badge variant="destructive" data-testid={`badge-revoked-${token.id}`}>Revoked</Badge>
                                ) : (
                                  <Badge variant="default" data-testid={`badge-active-${token.id}`}>Active</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span data-testid={`text-created-${token.id}`}>
                                  Created: {formatDate(token.created_at)}
                                </span>
                                {token.last_used_at && (
                                  <span className="ml-4" data-testid={`text-last-used-${token.id}`}>
                                    Last used: {formatDate(token.last_used_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {!token.revoked && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeTokenMutation.mutate(token.id)}
                                disabled={revokeTokenMutation.isPending}
                                data-testid={`button-revoke-${token.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Revoke
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500" data-testid="text-no-tokens">
                    No extension tokens created yet. Create one above to get started.
                  </div>
                )}
              </div>

              {/* Installation Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Extension Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Create an extension token above</li>
                    <li>Download the Content Radar Chrome Extension</li>
                    <li>Go to chrome://extensions/ and enable Developer Mode</li>
                    <li>Load the unpacked extension</li>
                    <li>Enter your API token in the extension settings</li>
                    <li>Start capturing content from any website!</li>
                  </ol>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Account settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Third-party Integrations</CardTitle>
              <CardDescription>Connect external services and APIs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Integration settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}