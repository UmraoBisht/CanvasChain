'use client';

import React, { useState } from 'react';
import { Button, Card } from '@canvas-chain/ui';
import { IconMessageCircle, IconSend, IconChevronDown, IconChevronUp } from '@canvas-chain/icons';

export interface ChatMessage {
  id: string;
  author: string;
  color: string;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-auto">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-10 px-3.5 gap-2 bg-card/90 backdrop-blur-md border border-border/80 shadow-2xl text-foreground hover:bg-card rounded-full font-medium text-xs"
        >
          <IconMessageCircle className="w-4 h-4 text-indigo-500" />
          <span>Room Chat</span>
          {messages.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {messages.length}
            </span>
          )}
        </Button>
      ) : (
        <Card className="w-80 h-96 p-4 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl flex flex-col space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
              <IconMessageCircle className="w-4 h-4 text-indigo-500" />
              <span>Live Room Chat</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <IconChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-[11px]">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-secondary/40 p-2 rounded-lg space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span style={{ color: m.color }} className="font-bold">
                      {m.author}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-foreground text-xs">{m.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Input Box */}
          <div className="flex gap-1.5 border-t border-border/60 pt-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-secondary/60 px-3 py-1.5 rounded-lg text-xs outline-none border border-border text-foreground"
            />
            <Button size="icon" className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSend}>
              <IconSend className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
