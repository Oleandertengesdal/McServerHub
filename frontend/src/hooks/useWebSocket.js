import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom React hook for WebSocket connections via STOMP/SockJS.
 *
 * Usage:
 *   const { connected, messages, sendCommand } = useWebSocket(serverId);
 *
 * Subscribes to:
 *   /topic/servers/{serverId}/console
 *   /topic/servers/{serverId}/status
 *   /topic/servers/{serverId}/metrics
 */
export function useWebSocket(serverId) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [serverStatus, setServerStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!serverId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);

        // Subscribe to console output
        client.subscribe(`/topic/servers/${serverId}/console`, (message) => {
          const data = JSON.parse(message.body);
          setConsoleMessages((prev) => [...prev.slice(-500), data]); // Keep last 500
        });

        // Subscribe to status changes
        client.subscribe(`/topic/servers/${serverId}/status`, (message) => {
          const data = JSON.parse(message.body);
          setServerStatus(data.status);
        });

        // Subscribe to metrics
        client.subscribe(`/topic/servers/${serverId}/metrics`, (message) => {
          const data = JSON.parse(message.body);
          setMetrics(data);
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [serverId]);

  /**
   * Send a command to the server via WebSocket.
   */
  const sendCommand = useCallback(
    (command) => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: `/app/servers/${serverId}/command`,
          body: JSON.stringify({ command }),
        });
      }
    },
    [serverId]
  );

  /**
   * Clear console messages.
   */
  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  return {
    connected,
    consoleMessages,
    serverStatus,
    metrics,
    sendCommand,
    clearConsole,
  };
}

/**
 * Simplified hook for subscribing to a single WebSocket topic.
 *
 * Usage:
 *   const { connected, lastMessage } = useStompSubscription(
 *     `/topic/servers/${serverId}/status`
 *   );
 */
export function useStompSubscription(topic) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!topic) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (message) => {
          setLastMessage(JSON.parse(message.body));
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) clientRef.current.deactivate();
    };
  }, [topic]);

  return { connected, lastMessage };
}
