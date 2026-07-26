'use client';

import React from 'react';
import { Button, Card } from '@canvas-chain/ui';
import { IconMic, IconMicOff, IconPhoneCall, IconPhoneOff } from '@canvas-chain/icons';
import { useWebRTCVoice } from '../hooks/useWebRTCVoice';
import { CollaboratorUser } from './PresenceBar';

interface VoiceCallPanelProps {
  currentUser: CollaboratorUser;
}

export function VoiceCallPanel({ currentUser }: VoiceCallPanelProps) {
  const { isInCall, isMuted, isSpeaking, startCall, endCall, toggleMute } = useWebRTCVoice(currentUser);

  return (
    <div className="fixed bottom-4 right-84 z-40 pointer-events-auto">
      {!isInCall ? (
        <Button
          onClick={startCall}
          className="h-10 px-3.5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl rounded-full font-medium text-xs"
        >
          <IconPhoneCall className="w-4 h-4" />
          <span>Join Voice Call (WebRTC)</span>
        </Button>
      ) : (
        <Card className="px-3.5 py-2 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-full flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isSpeaking ? 'animate-ping bg-emerald-400 opacity-90' : 'bg-emerald-500 opacity-40'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSpeaking ? 'bg-emerald-400 shadow-md shadow-emerald-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <span className="font-semibold text-foreground">
              WebRTC Voice {isSpeaking ? '(Speaking)' : '(Connected)'}
            </span>
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* Mute / Unmute Button */}
          <Button
            variant={isMuted ? 'destructive' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <IconMicOff className="w-4 h-4" /> : <IconMic className="w-4 h-4 text-emerald-400" />}
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={endCall}
            title="Leave WebRTC Call"
          >
            <IconPhoneOff className="w-4 h-4" />
          </Button>
        </Card>
      )}
    </div>
  );
}
