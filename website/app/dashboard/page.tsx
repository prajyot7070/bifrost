"use client";
import { useState } from "react";
import { Eye, EyeOff, Copy, LogOut, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { toast } from "sonner";

const mockTunnels = [
  {
    id: "abc123",
    url: "https://abc123.bifrost.dev",
    status: "Active",
    createdAt: "2025-07-15",
  },
  {
    id: "xyz789",
    url: "https://xyz789.bifrost.dev",
    status: "Inactive",
    createdAt: "2025-07-10",
  },
];

export default function DashboardPage() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [username, setUsername] = useState("Prajyot");
  const apiKey = "sk-bifrost-93nvasdd98vjsd";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API Key copied!");
  };

  const openTunnel = (url: string) => {
    window.open(url, '_blank');
  };

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
              onClick={() => console.log("Logout clicked")}
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
                  {mockTunnels.filter(t => t.status === 'Active').length}
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
                <p className="text-2xl font-bold text-white">{mockTunnels.length}</p>
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
                <p className="text-2xl font-bold text-white">2</p>
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
                    value={apiKey}
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
              <Button
                className="bg-white text-black hover:bg-zinc-200 font-medium px-4 py-2 self-start sm:self-auto"
                onClick={() => console.log("Create new tunnel")}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Tunnel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table
              data={mockTunnels}
              columns={[
                { 
                  key: "url", 
                  label: "Tunnel URL",
                  render: (row: any) => (
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-white">{row.url}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openTunnel(row.url)}
                        className="text-zinc-400 hover:text-white h-6 w-6"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  )
                },
                { 
                  key: "status", 
                  label: "Status",
                  render: (row: any) => (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        row.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        row.status === 'Active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {row.status}
                      </span>
                    </div>
                  )
                },
                { 
                  key: "createdAt", 
                  label: "Created",
                  render: (row: any) => (
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
                  render: (row: any) => (
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
          </div>

          {mockTunnels.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No tunnels yet</h3>
              <p className="text-zinc-400 mb-6">
                Create your first tunnel to start sharing your local development server
              </p>
              <Button
                className="bg-white text-black hover:bg-zinc-200 font-medium"
                onClick={() => console.log("Create first tunnel")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Tunnel
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
