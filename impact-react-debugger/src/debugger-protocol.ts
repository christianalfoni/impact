import { DebuggerProtocol } from "./types";

type DebuggerProtocolMap = {
  [K in DebuggerProtocol["type"]]: Extract<
    DebuggerProtocol,
    { type: K }
  >["data"];
};

export class DebuggerProtocolSender {
  private targetOrigin: string;
  private target: Window | Worker;

  constructor(target: Window | Worker, targetOrigin: string = "*") {
    this.target = target;
    this.targetOrigin = targetOrigin;
  }

  sendMessage<T extends DebuggerProtocol["type"]>(
    type: T,
    data?: DebuggerProtocolMap[T],
  ) {
    this.target.postMessage(
      { type, data },
      this.targetOrigin as WindowPostMessageOptions,
    );
  }
}

export class DebuggerProtocolReceiver {
  private handlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data as DebuggerProtocol;
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }
  }

  on<T extends DebuggerProtocol["type"]>(
    type: T,
    handler: (data: DebuggerProtocolMap[T]) => void,
  ) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }
}
