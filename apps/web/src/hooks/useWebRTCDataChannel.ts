'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useWebRTCDataChannel(onMessage: (data: any) => void) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const postSignal = useCallback((msg: any) => {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    }).catch(() => {});
  }, []);

  const sendData = useCallback((payload: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(JSON.stringify(payload));
        return true;
      } catch (e) {}
    }
    return false;
  }, []);

  const initPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Create WebRTC P2P DataChannel
    const dc = pc.createDataChannel('canvas-p2p-sync', { ordered: false });
    dc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {}
    };
    dataChannelRef.current = dc;

    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      receiveChannel.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage(data);
        } catch (err) {}
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({ type: 'WEBRTC_ICE', candidate: event.candidate });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [onMessage, postSignal]);

  return {
    initPeerConnection,
    sendData,
  };
}
