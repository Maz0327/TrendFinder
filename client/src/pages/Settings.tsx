import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Chrome, Smartphone, Trash2, Edit3 } from "lucide-react";

interface ExtensionDevice {
  id: string;
  label: string;
  last_seen_at: string;
  created_at: string;
  revoked_at?: string;
}

function ExtensionIntegration() {
  const [newPairLabel, setNewPairLabel] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch extension devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/extension/devices"],
  });

  // Generate pairing code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async (label: string) => {
      return await apiRequest("/api/extension/pair", {
        method: "POST",
        body: { label: label || null },
      });
    },
    onSuccess: (data) => {
      setPairingCode(data.code);
      setNewPairLabel("");
      setIsGeneratingCode(false);
      toast({
        title: "Pairing code generated",
        description: "Use this code to connect your Chrome extension",
      });
    },
    onError: (error) => {
      setIsGeneratingCode(false);
      toast({
        title: "Failed to generate code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Revoke device mutation
  const revokeDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return await apiRequest(`/api/extension/devices/${deviceId}`, {
        method: "PATCH",
        body: { revoke: true },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/extension/devices"] });
      toast({
        title: "Device revoked",
        description: "The extension device has been disconnected",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revoke device",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateCode = () => {
    setIsGeneratingCode(true);
    generateCodeMutation.mutate(newPairLabel);
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className="frost-card p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Chrome className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">Chrome Extension</h3>
            <p className="text-sm text-muted-foreground">
              Connect your browser extension for seamless content capture
            </p>
          </div>
        </div>

        {/* Generate Pairing Code Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-label">Device Label (Optional)</Label>
            <Input
              id="device-label"
              data-testid="input-device-label"
              placeholder="My Work Laptop"
              value={newPairLabel}
              onChange={(e) => setNewPairLabel(e.target.value)}
              className="frost-strong"
            />
          </div>

          <Button
            onClick={handleGenerateCode}
            disabled={isGeneratingCode}
            className="frost-strong"
            data-testid="button-generate-pairing-code"
          >
            {isGeneratingCode ? "Generating..." : "Generate Pairing Code"}
          </Button>

          {pairingCode && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                Pairing Code Generated
              </div>
              <div className="text-2xl font-mono font-bold text-green-900 dark:text-green-100 mt-2">
                {pairingCode}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                Enter this code in your Chrome extension to connect it to your account.
                The code expires in 10 minutes.
              </div>
            </div>
          )}
        </div>

        {/* Connected Devices Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Connected Devices</h4>
          
          {devicesLoading ? (
            <div className="text-sm text-muted-foreground">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No devices connected yet. Generate a pairing code to connect your Chrome extension.
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device: ExtensionDevice) => (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-3 rounded-lg border frost-subtle ${
                    device.revoked_at ? "opacity-50" : ""
                  }`}
                  data-testid={`device-item-${device.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4" />
                    <div>
                      <div className="font-medium">
                        {device.label || "Unnamed Device"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {device.revoked_at 
                          ? "Disconnected" 
                          : `Last seen ${formatLastSeen(device.last_seen_at)}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {!device.revoked_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeDeviceMutation.mutate(device.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-revoke-${device.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Settings() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Integrations</h2>
          <ExtensionIntegration />
        </div>
      </div>
    </div>
  );
}