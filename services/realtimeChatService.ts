export type ChatEvent =
  | { type: 'connected'; payload: { id: string; users: Array<{ id: string; name: string }> } }
  | { type: 'presence'; payload: { event: 'join' | 'leave'; user: { id: string; name: string } } }
  | { type: 'typing'; payload: { user: { id: string; name: string }; isTyping: boolean } }
  | { type: 'message'; payload: { id: string; content: string; sender: 'user' | 'bot'; user?: { id: string; name: string }; timestamp: string; meta?: any } };

class RealtimeChatService {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<(event: ChatEvent) => void> = new Set();
  private reconnectInterval = 3000;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private clientId: string | null = null;

  constructor(url?: string) {
    this.url = url || `ws://localhost:4000`;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (ev) => {
      try {
        const data: ChatEvent = JSON.parse(ev.data);
        if (data.type === 'connected') {
          this.clientId = data.payload.id;
        }
        this.listeners.forEach((cb) => cb(data));
      } catch {
        // ignore
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectInterval * this.reconnectAttempts);
      }
    };
  }

  on(cb: (event: ChatEvent) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  sendMessage(content: string, meta?: any) {
    const payload = {
      type: 'message',
      id: `${Date.now()}`,
      content,
      sender: 'user' as const,
      user: { id: this.clientId || 'local', name: 'You' },
      timestamp: new Date().toISOString(),
      meta,
    };
    this.ws?.send(JSON.stringify(payload));
  }

  sendTyping(isTyping: boolean) {
    const payload = { type: 'typing', user: { id: this.clientId || 'local', name: 'You' }, isTyping };
    this.ws?.send(JSON.stringify(payload));
  }

  getClientId() {
    return this.clientId;
  }
}

export const realtimeChatService = new RealtimeChatService();
export default realtimeChatService;
