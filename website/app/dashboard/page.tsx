"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, LogOut, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Assuming useRouter is needed elsewhere

interface Tunnel {
  id: string;
  clientId: string;
  subdomain: string;
  publicUrl: string;
  localPort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivity: string | null;
  userId: string;
}

export default function DashboardPage() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [fullGeneratedApiKey, setFullGeneratedApiKey] = useState<string | null>(null);
  const [displayApiKeyIdentifier, setDisplayApiKeyIdentifier] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const router = useRouter(); // Initialize useRouter if used for redirects like below

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); // Use router.push for Next.js navigation
  };

  const getApiKey = async () => {
    setIsGeneratingKey(true);
    setFullGeneratedApiKey(null);
    setDisplayApiKeyIdentifier(null);
    try {
      const apikeyResponse = await fetch("/api/apikeys", { method: "POST"});
      if (!apikeyResponse.ok) {
        const errorData = await apikeyResponse.json();
        console.error("Failed to generate API key:", errorData);
        toast.error(errorData.error || "Failed to generate API key");
        return;
      }
      const data = await apikeyResponse.json();
      const generatedApiKey = data.apiKey;

      if (!generatedApiKey || typeof generatedApiKey !== 'string') {
        console.error("API response missing or invalid 'apiKey' property:", data);
        toast.error("API did not return a valid key. Please try again.");
        return;
      }

      setFullGeneratedApiKey(generatedApiKey);
      setDisplayApiKeyIdentifier(`sk-bifrost-...${generatedApiKey.substring(generatedApiKey.length - 8)}`);
      toast.success("Copy this key! You will not see it again");
    } catch (error: any) {
      console.error("Error generating API key:", error);
      toast.error("An error occurred during key generation.");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyToClipboard = () => {
    if (fullGeneratedApiKey) {
      navigator.clipboard.writeText(fullGeneratedApiKey);
      toast.success("API Key copied!");
    } else if (displayApiKeyIdentifier) {
      toast.error("Full API Key not available for copy. Generate a new one if needed.");
    } else {
      toast.error("No API Key to copy.");
    }
  };

  const openTunnel = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUsername(userData.name || userData.email);
          setDisplayApiKeyIdentifier(userData.apiKey || null);
        } else {
          console.error("Failed to fetch user data");
          toast.error("Failed to load user data");
          // Optionally redirect to login if user data fetch fails (e.g., unauthorized)
          // router.push('/login');
        }

        const tunnelsRes = await fetch("/api/tunnels");
        if (!tunnelsRes.ok) throw new Error("Failed to fetch tunnels");
        const tunnelsData = await tunnelsRes.json();
        setTunnels(tunnelsData.tunnels);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Bifrost Dashboard</h1>
              <div className="hidden sm:block w-px h-6 bg-zinc-700"></div>
              <span className="hidden sm:inline-block text-sm text-zinc-400">
                Welcome back, {username}
              </span>
            </div>
            <Button
              variant="ghost"
              className="text-zinc-300 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:hidden mb-6">
          <h2 className="text-lg font-semibold text-white">
            Welcome back, {username}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Tunnels</p>
                <p className="text-2xl font-bold text-white">
                  {tunnels.filter(t => t.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Tunnels</p>
                <p className="text-2xl font-bold text-white">{tunnels.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ExternalLink size={20} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">This Month</p>
                <p className="text-2xl font-bold text-white">
                  {tunnels.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth() && new Date(t.createdAt).getFullYear() === new Date().getFullYear()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Plus size={20} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">API Configuration</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-zinc-400">Active</span>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div className="relative w-full">
                <input
                  type={apiKeyVisible ? "text" : "password"}
                  value={fullGeneratedApiKey || displayApiKeyIdentifier || "No API Key. Click GET KEY."}
                  readOnly
                  className="w-full bg-zinc-800 text-white px-4 py-3 pr-20 rounded-lg border border-zinc-700 focus:border-zinc-600 transition-colors font-mono text-sm"
                />

                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-700 h-8 w-8"
                  >
                    {apiKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-700 h-8 w-8"
                    disabled={!fullGeneratedApiKey && !displayApiKeyIdentifier}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <Button
                onClick={getApiKey}
                className="w-full sm:w-fit bg-white text-black hover:bg-zinc-200 transition"
                disabled={isGeneratingKey}
              >
                {isGeneratingKey ? 'Generating...' : 'GET KEY'}
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-zinc-500 mt-3">
              <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
              <span>Keep your API key secure and never share it publicly</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Your Tunnels</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Manage and monitor your active tunnel connections
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {tunnels.length > 0 ? (
              <Table
                data={tunnels}
                columns={[
                  {
                    key: "publicUrl",
                    label: "Tunnel URL",
                    render: (row: Tunnel) => (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-white">{row.publicUrl}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openTunnel(row.publicUrl)}
                          className="text-zinc-400 hover:text-white h-6 w-6"
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    )
                  },
                  {
                    key: "isActive",
                    label: "Status",
                    render: (row: Tunnel) => (
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          row.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          row.isActive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    )
                  },
                  {
                    key: "createdAt",
                    label: "Created",
                    render: (row: Tunnel) => (
                      <span className="text-sm text-zinc-400">
                        {new Date(row.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    )
                  },
                  {
                    key: "actions",
                    label: "",
                    render: (row: Tunnel) => (
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => console.log("Delete", row.id)}
                          className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink size={32} className="text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No tunnels yet</h3>
                <p className="text-zinc-400 mb-6">
                  Create your first tunnel to start sharing your local development server
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
