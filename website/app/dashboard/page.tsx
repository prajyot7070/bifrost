"use client";
import { useState, useEffect } from "react"; // Ensure useEffect is imported
import { Eye, EyeOff, Copy, LogOut, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { toast } from "sonner";

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
  const [username, setUsername] = useState("Loading..."); // Initialize with loading state
  const [tunnels, setTunnels] = useState<Tunnel[]>([]); // Use the Tunnel interface
  const [apiKey, setApiKey] = useState<string | null>(null); // Initialize as null, fetch from API

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("API Key copied!");
    } else {
      toast.error("API Key not available.");
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
          setApiKey(userData.apiKey || null); 
          } else {
          console.error("Failed to fetch user data");
          toast.error("Failed to load user data");
          }

        // Fetch Tunnels
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
      {/* Header */}
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
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Welcome Message */}
        <div className="sm:hidden mb-6">
          <h2 className="text-lg font-semibold text-white">
            Welcome back, {username}
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Tunnels</p>
                <p className="text-2xl font-bold text-white">
                  {tunnels.filter(t => t.isActive).length} {/* FIX: Use t.isActive */}
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
                <ExternalLink className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">This Month</p>
                <p className="text-2xl font-bold text-white">
                  {/* FIX: Implement logic to count tunnels created this month */}
                  {tunnels.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth() && new Date(t.createdAt).getFullYear() === new Date().getFullYear()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">API Configuration</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-zinc-400">Active</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={apiKeyVisible ? "text" : "password"}
                    value={apiKey || "Loading API Key..."} // Display loading state
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
                      disabled={!apiKey} // Disable copy if API key not loaded
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-zinc-500">
                <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                <span>Keep your API key secure and never share it publicly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tunnels Section */}
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
            {tunnels.length > 0 ? ( // Only render table if tunnels exist
              <Table
                data={tunnels}
                columns={[
                  { 
                    key: "publicUrl", // Changed from 'url' to 'publicUrl' to match schema
                    label: "Tunnel URL",
                    render: (row: Tunnel) => ( // Use Tunnel type
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
                    key: "isActive", // Changed from 'status' to 'isActive'
                    label: "Status",
                    render: (row: Tunnel) => ( // Use Tunnel type
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          row.isActive ? 'bg-green-500' : 'bg-red-500' // FIX: Check row.isActive
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          row.isActive ? 'text-green-400' : 'text-red-400' // FIX: Check row.isActive
                        }`}>
                          {row.isActive ? 'Active' : 'Inactive'} {/* FIX: Display 'Active'/'Inactive' */}
                        </span>
                      </div>
                    )
                  },
                  { 
                    key: "createdAt", 
                    label: "Created",
                    render: (row: Tunnel) => ( // Use Tunnel type
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
                    render: (row: Tunnel) => ( // Use Tunnel type
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
            ) : ( // Render no tunnels message if array is empty
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-zinc-500" />
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
