import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function Integrations() {
  const [googleTokens, setGoogleTokens] = useState({
    accessToken: "",
    refreshToken: "",
    clientId: "",
    clientSecret: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveGoogleTokens = async () => {
    if (!googleTokens.accessToken || !googleTokens.clientId) {
      toast({
        title: "Missing Information",
        description: "Please provide at least Access Token and Client ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save integration tokens",
          variant: "destructive"
        });
        return;
      }

      // Store tokens in user profile google_tokens column
      const { error } = await supabase
        .from('users')
        .update({
          google_tokens: googleTokens,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Google integration tokens saved successfully"
      });

      // Clear the form for security
      setGoogleTokens({
        accessToken: "",
        refreshToken: "",
        clientId: "",
        clientSecret: ""
      });
    } catch (error: any) {
      console.error('Error saving tokens:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save tokens",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect external services to enable advanced features like Google Slides export.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Google OAuth Configuration</CardTitle>
          <CardDescription>
            Configure Google API access for features like Google Slides export. 
            You'll need to set up OAuth credentials in Google Cloud Console first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="your-client-id.googleusercontent.com"
              value={googleTokens.clientId}
              onChange={(e) => setGoogleTokens(prev => ({ ...prev, clientId: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="Your client secret"
              value={googleTokens.clientSecret}
              onChange={(e) => setGoogleTokens(prev => ({ ...prev, clientSecret: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Your access token"
              value={googleTokens.accessToken}
              onChange={(e) => setGoogleTokens(prev => ({ ...prev, accessToken: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refreshToken">Refresh Token (Optional)</Label>
            <Input
              id="refreshToken"
              type="password"
              placeholder="Your refresh token"
              value={googleTokens.refreshToken}
              onChange={(e) => setGoogleTokens(prev => ({ ...prev, refreshToken: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleSaveGoogleTokens}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save Google Integration"}
          </Button>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Go to Google Cloud Console</li>
              <li>Create a new project or select existing</li>
              <li>Enable Google Slides API and Google Drive API</li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Copy the credentials and paste them above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}