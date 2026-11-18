import { computeStats, getStore, subscribe } from "@/lib/store";

export async function GET() {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  let ping: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // client disconnected
        }
      };

      send("stats", computeStats(getStore()));
      cleanup = subscribe((evt) => {
        send(evt.type, { at: Date.now() });
        send("stats", computeStats(getStore()));
      });
      ping = setInterval(() => send("ping", { at: Date.now() }), 15000);
    },
    cancel() {
      if (cleanup) cleanup();
      if (ping) clearInterval(ping);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}