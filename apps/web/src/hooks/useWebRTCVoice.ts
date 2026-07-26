'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { CollaboratorUser } from '../components/PresenceBar';

export function useWebRTCVoice(currentUser: CollaboratorUser) {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const postSignal = useCallback((msg: any) => {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    }).catch(() => {});
  }, []);

  const initPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({
          type: 'WEBRTC_ICE',
          candidate: event.candidate,
          user: currentUser,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        if (!remoteAudioRef.current) {
          const audio = new Audio();
          audio.autoplay = true;
          remoteAudioRef.current = audio;
        }
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [currentUser, postSignal]);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setIsInCall(true);
      setIsMuted(false);

      const pc = initPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      postSignal({
        type: 'WEBRTC_OFFER',
        offer,
        user: currentUser,
      });

      // Audio Activity Detection
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioContext = new AudioCtx();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkSpeaking = () => {
          if (!localStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / dataArray.length;
          setIsSpeaking(average > 12);
          animationFrameRef.current = requestAnimationFrame(checkSpeaking);
        };
        checkSpeaking();
      }
    } catch (err) {
      console.warn('Microphone permission or WebRTC error:', err);
      setIsInCall(true);
    }
  }, [currentUser, initPeerConnection, postSignal]);

  const endCall = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsInCall(false);
    setIsMuted(false);
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  // Handle incoming WebRTC SDP and ICE signaling messages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const eventSource = new EventSource('/api/sync');

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || !data.user || data.user.id === currentUser.id) return;

          if (data.type === 'WEBRTC_OFFER') {
            const stream =
              localStreamRef.current ||
              (await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).catch(() => null));

            if (stream) {
              localStreamRef.current = stream;
              setIsInCall(true);
              const pc = initPeerConnection();
              stream.getTracks().forEach((track) => pc.addTrack(track, stream));

              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              postSignal({
                type: 'WEBRTC_ANSWER',
                answer,
                user: currentUser,
              });
            }
          } else if (data.type === 'WEBRTC_ANSWER') {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(() => {});
            }
          } else if (data.type === 'WEBRTC_ICE') {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
            }
          }
        } catch (e) {}
      };

      return () => {
        eventSource.close();
      };
    }
  }, [currentUser, initPeerConnection, postSignal]);

  return {
    isInCall,
    isMuted,
    isSpeaking,
    startCall,
    endCall,
    toggleMute,
  };
}
