'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RemoteUserCursor } from '../components/RemoteCursors';
import { CollaboratorUser } from '../components/PresenceBar';
import { ChatMessage } from '../components/ChatPanel';

const USER_COLORS = [
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

const DEFAULT_USER: CollaboratorUser = {
  id: 'user-me',
  name: 'You',
  color: '#6366f1',
  avatar: 'ME',
  isSelf: true,
};

export function useCollaboration() {
  const [currentUser, setCurrentUser] = useState<CollaboratorUser>(DEFAULT_USER);
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([DEFAULT_USER]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteUserCursor[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [roomRole, setRoomRole] = useState<'editor' | 'viewer'>('editor');

  const currentUserRef = useRef<CollaboratorUser>(DEFAULT_USER);
  currentUserRef.current = currentUser;

  const channelRef = useRef<BroadcastChannel | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const lastCursorSendRef = useRef<number>(0);

  // Send message over WebRTC P2P DataChannel
  const sendP2PData = useCallback((msg: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify(msg));
        return true;
      } catch (e) {}
    }
    return false;
  }, []);

  // WebRTC P2P + BroadcastChannel + SSE Fallback Protocol
  const postEvent = useCallback(
    (msg: any) => {
      // 1. Try sending over WebRTC P2P DataChannel (0 Server Hits, 0ms P2P)
      const isSentP2P = sendP2PData(msg);

      // 2. Send over in-memory BroadcastChannel for local tabs
      if (channelRef.current) {
        try {
          channelRef.current.postMessage(msg);
        } catch (e) {}
      }

      // 3. Fallback to SSE endpoint for initial peer discovery / fallback
      if (!isSentP2P) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msg),
        }).catch(() => {});
      }
    },
    [sendP2PData],
  );

  const handleIncomingMessage = useCallback(
    (msg: any) => {
      const selfUser = currentUserRef.current;
      if (!msg || typeof msg !== 'object' || !msg.user || msg.user.id === selfUser.id) return;

      if (msg.type === 'PRESENCE_PING') {
        setCollaborators((prev) => {
          if (prev.some((u) => u.id === msg.user.id)) return prev;
          return [...prev, msg.user];
        });
        postEvent({ type: 'PRESENCE_PONG', user: selfUser });
      } else if (msg.type === 'PRESENCE_PONG') {
        setCollaborators((prev) => {
          if (prev.some((u) => u.id === msg.user.id)) return prev;
          return [...prev, msg.user];
        });
      } else if (msg.type === 'CURSOR_MOVE') {
        setRemoteCursors((prev) => {
          const filtered = prev.filter((c) => c.id !== msg.user.id);
          return [
            ...filtered,
            {
              id: msg.user.id,
              name: msg.user.name,
              color: msg.user.color,
              x: msg.coords.x,
              y: msg.coords.y,
            },
          ];
        });
      } else if (msg.type === 'CHAT_MSG') {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.message.id)) return prev;
          return [...prev, msg.message];
        });
      }
    },
    [postEvent],
  );

  // Initialize WebRTC P2P DataChannel Peer Connection
  const initWebRTC = useCallback(() => {
    if (peerConnectionRef.current) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    peerConnectionRef.current = pc;

    // Create Outgoing WebRTC DataChannel
    const dc = pc.createDataChannel('canvas-p2p-data', { ordered: false });
    dc.onmessage = (e) => {
      try {
        handleIncomingMessage(JSON.parse(e.data));
      } catch (err) {}
    };
    dataChannelRef.current = dc;

    // Receive Incoming WebRTC DataChannel
    pc.ondatachannel = (e) => {
      const receiveChannel = e.channel;
      receiveChannel.onmessage = (evt) => {
        try {
          handleIncomingMessage(JSON.parse(evt.data));
        } catch (err) {}
      };
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'WEBRTC_DATA_ICE',
            candidate: e.candidate,
            user: currentUserRef.current,
          }),
        }).catch(() => {});
      }
    };
  }, [handleIncomingMessage]);

  useEffect(() => {
    const randomId = Math.random().toString(36).substring(2, 7);
    const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Casey', 'Riley'];
    const name = names[Math.floor(Math.random() * names.length)];

    const user: CollaboratorUser = {
      id: randomId,
      name,
      color,
      avatar: name.slice(0, 2).toUpperCase(),
      isSelf: true,
    };

    setCurrentUser(user);
    setCollaborators([user]);
    currentUserRef.current = user;

    if (typeof window !== 'undefined') {
      initWebRTC();

      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('canvas-chain-multiplayer');
        channelRef.current = bc;
        bc.onmessage = (event) => handleIncomingMessage(event.data);
      }

      const eventSource = new EventSource('/api/sync');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (e) {}
      };

      postEvent({ type: 'PRESENCE_PING', user });

      const heartbeat = setInterval(() => {
        postEvent({ type: 'PRESENCE_PING', user });
      }, 2000);

      return () => {
        clearInterval(heartbeat);
        eventSource.close();
        if (channelRef.current) {
          channelRef.current.close();
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }
      };
    }
  }, [handleIncomingMessage, initWebRTC, postEvent]);

  // Throttled 16ms cursor movement broadcast (~60fps)
  const broadcastCursorMove = useCallback(
    (coords: { x: number; y: number }) => {
      const now = Date.now();
      if (now - lastCursorSendRef.current < 16) return;
      lastCursorSendRef.current = now;

      postEvent({
        type: 'CURSOR_MOVE',
        user: currentUserRef.current,
        coords,
      });
    },
    [postEvent],
  );

  const sendChatMessage = useCallback(
    (text: string) => {
      const user = currentUserRef.current;
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        author: user.name,
        color: user.color,
        text,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, newMsg]);
      postEvent({ type: 'CHAT_MSG', user, message: newMsg });
    },
    [postEvent],
  );

  return {
    currentUser,
    collaborators,
    remoteCursors,
    chatMessages,
    sendChatMessage,
    broadcastCursorMove,
    roomRole,
    setRoomRole,
  };
}
