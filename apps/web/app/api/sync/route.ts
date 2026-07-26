import { NextRequest, NextResponse } from 'next/server';

// In-memory client stream subscribers for real-time SSE server relay
type ClientSubscriber = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const subscribers = new Set<ClientSubscriber>();

export async function GET(req: NextRequest) {
  const clientId = Math.random().toString(36).substring(2, 9);

  const stream = new ReadableStream({
    start(controller) {
      const subscriber: ClientSubscriber = { id: clientId, controller };
      subscribers.add(subscriber);

      // Send initial heartbeat connection acknowledgment
      const data = `data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      req.signal.addEventListener('abort', () => {
        subscribers.delete(subscriber);
      });
    },
    cancel() {
      // Clean up disconnected subscriber
      for (const sub of Array.from(subscribers)) {
        if (sub.id === clientId) {
          subscribers.delete(sub);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const message = `data: ${JSON.stringify(payload)}\n\n`;
    const encoded = new TextEncoder().encode(message);

    // Relay payload to all active client streams across browsers and devices
    subscribers.forEach((sub) => {
      try {
        sub.controller.enqueue(encoded);
      } catch (err) {
        subscribers.delete(sub);
      }
    });

    return NextResponse.json({ success: true, activeClients: subscribers.size });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to broadcast event' }, { status: 500 });
  }
}
