import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serverApi } from '../api';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Terminal,
  Settings,
  HardDrive,
  Users,
  Send,
} from 'lucide-react';

export default function ServerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState([]);
  const [activeTab, setActiveTab] = useState('console');

  useEffect(() => {
    fetchServer();
  }, [id]);

  const fetchServer = async () => {
    try {
      const response = await serverApi.get(id);
      setServer(response.data.data);
    } catch (err) {
      console.error('Error fetching server:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    try {
      const response = await serverApi.executeCommand(id, command);
      setCommandOutput((prev) => [
        ...prev,
        { input: command, output: response.data.data, time: new Date().toLocaleTimeString() },
      ]);
      setCommand('');
    } catch (err) {
      setCommandOutput((prev) => [
        ...prev,
        {
          input: command,
          output: err.response?.data?.message || 'Command failed',
          error: true,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setCommand('');
    }
  };

  const handleAction = async (action) => {
    try {
      switch (action) {
        case 'start':
          await serverApi.start(id);
          break;
        case 'stop':
          await serverApi.stop(id);
          break;
        case 'restart':
          await serverApi.restart(id);
          break;
      }
      fetchServer();
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading server...</div>;
  }

  if (!server) {
    return <div className="text-center py-20 text-gray-500">Server not found</div>;
  }

  const tabs = [
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'backups', label: 'Backups', icon: HardDrive },
    { id: 'players', label: 'Players', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{server.name}</h1>
          <p className="text-sm text-gray-500">
            {server.serverType} {server.version} &middot; Port {server.port}
          </p>
        </div>
        <div className="flex gap-2">
          {server.status === 'STOPPED' && (
            <button onClick={() => handleAction('start')} className="btn-success flex items-center gap-2">
              <Play className="w-4 h-4" /> Start
            </button>
          )}
          {server.status === 'RUNNING' && (
            <>
              <button onClick={() => handleAction('restart')} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Restart
              </button>
              <button onClick={() => handleAction('stop')} className="btn-danger flex items-center gap-2">
                <Square className="w-4 h-4" /> Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="card grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <p className={`font-medium ${
            server.status === 'RUNNING' ? 'text-green-400' :
            server.status === 'ERROR' ? 'text-red-400' : 'text-gray-400'
          }`}>{server.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Players</p>
          <p className="font-medium text-white">0 / {server.maxPlayers}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Memory</p>
          <p className="font-medium text-white">{server.maxMemory} MB</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Port</p>
          <p className="font-medium text-white">{server.port}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">RCON Port</p>
          <p className="font-medium text-white">{server.rconPort}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                       ${activeTab === tab.id
                         ? 'border-brand-500 text-brand-400'
                         : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'console' && (
        <div className="card">
          {/* Console output */}
          <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm mb-4">
            {commandOutput.length === 0 ? (
              <p className="text-gray-600">
                Server console ready. Type a command below to get started.
              </p>
            ) : (
              commandOutput.map((entry, i) => (
                <div key={i} className="mb-2">
                  <div className="text-gray-500">
                    <span className="text-gray-600">[{entry.time}]</span>{' '}
                    <span className="text-brand-400">{'>'}</span> {entry.input}
                  </div>
                  <div className={entry.error ? 'text-red-400' : 'text-green-400'}>
                    {entry.output || '(no output)'}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Command input */}
          <form onSubmit={handleCommand} className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="input-field flex-1 font-mono"
              placeholder={server.status === 'RUNNING' ? 'Enter command...' : 'Server must be running'}
              disabled={server.status !== 'RUNNING'}
            />
            <button
              type="submit"
              disabled={server.status !== 'RUNNING' || !command.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="card">
          <p className="text-gray-500">Configuration editor coming soon...</p>
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="card">
          <p className="text-gray-500">Backup management coming soon...</p>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="card">
          <p className="text-gray-500">Player management coming soon...</p>
        </div>
      )}
    </div>
  );
}
