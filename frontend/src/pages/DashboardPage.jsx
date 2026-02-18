import { useState, useEffect } from 'react';
import { serverApi } from '../api';
import ServerCard from '../components/ServerCard';
import { Plus, RefreshCw, Server, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const response = await serverApi.list();
      setServers(response.data.data?.content || []);
      setError(null);
    } catch (err) {
      setError('Failed to load servers');
      console.error('Error fetching servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchServers, 30000);
    return () => clearInterval(interval);
  }, []);

  const runningCount = servers.filter((s) => s.status === 'RUNNING').length;
  const totalCount = servers.length;

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center">
            <Server className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
            <p className="text-sm text-gray-500">Total Servers</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{runningCount}</p>
            <p className="text-sm text-gray-500">Running</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-500">Players Online</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-500">Backups Today</p>
          </div>
        </div>
      </div>

      {/* Server list header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Servers</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchServers}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            New Server
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Server grid */}
      {loading && servers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          Loading servers...
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-20">
          <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No servers yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first Minecraft server to get started.
          </p>
          <button className="btn-primary">
            <Plus className="w-4 h-4 inline mr-2" />
            Create Server
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} onRefresh={fetchServers} />
          ))}
        </div>
      )}
    </div>
  );
}
