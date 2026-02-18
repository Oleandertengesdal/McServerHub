import { useNavigate } from 'react-router-dom';
import {
  Server,
  Play,
  Square,
  RotateCcw,
  Users,
  Cpu,
  HardDrive,
} from 'lucide-react';
import { serverApi } from '../api';
import { useState } from 'react';

const statusColors = {
  RUNNING: 'bg-green-500',
  STOPPED: 'bg-gray-500',
  STARTING: 'bg-yellow-500',
  STOPPING: 'bg-orange-500',
  ERROR: 'bg-red-500',
};

const statusText = {
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  STARTING: 'Starting...',
  STOPPING: 'Stopping...',
  ERROR: 'Error',
};

export default function ServerCard({ server, onRefresh }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action, e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      switch (action) {
        case 'start':
          await serverApi.start(server.id);
          break;
        case 'stop':
          await serverApi.stop(server.id);
          break;
        case 'restart':
          await serverApi.restart(server.id);
          break;
      }
      onRefresh?.();
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card cursor-pointer group"
      onClick={() => navigate(`/servers/${server.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
              {server.name}
            </h3>
            <p className="text-xs text-gray-500">
              {server.serverType} {server.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColors[server.status]} animate-pulse`} />
          <span className="text-xs text-gray-400">{statusText[server.status]}</span>
        </div>
      </div>

      {/* Server stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          <span>0/{server.maxPlayers}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Cpu className="w-4 h-4" />
          <span>{server.maxMemory}MB</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <HardDrive className="w-4 h-4" />
          <span>:{server.port}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-800">
        {server.status === 'STOPPED' && (
          <button
            onClick={(e) => handleAction('start', e)}
            disabled={loading}
            className="btn-success flex items-center gap-1 text-xs py-1.5 px-3"
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </button>
        )}
        {server.status === 'RUNNING' && (
          <>
            <button
              onClick={(e) => handleAction('stop', e)}
              disabled={loading}
              className="btn-danger flex items-center gap-1 text-xs py-1.5 px-3"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
            <button
              onClick={(e) => handleAction('restart', e)}
              disabled={loading}
              className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restart
            </button>
          </>
        )}
      </div>
    </div>
  );
}
