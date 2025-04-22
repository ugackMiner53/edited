import { PUBLIC_PIN_LENGTH } from "$env/static/public";

import type AbstractNetworkManager from "./NetworkManager";
import { MessageType } from "./NetworkManager";
import { type UUID, type Player, type Chain } from "$lib/Types";

export type WebsocketMessage = {
  type: MessageType,
  data: unknown
}

export default class WebsocketManager implements AbstractNetworkManager {
  websocket?: WebSocket;

  // Reciever methods that are reassigned by GameManager
  onConnect?: () => void;
  onPlayerJoin?: (player: Player) => void;
  onMessage?: (player: Player, message: string) => void;
  onChains?: (chains: Chain[]) => void;
  onQuestion?: (chainID: UUID, question: string) => void;
  onAnswer?: (chainID: UUID, answer: string) => void;
  onEdit?: (chainID: UUID, edit: string) => void;
  onShow?: (chainID: UUID) => void;
  onPlayerLeave?: (player: Player) => void;

  async connectToWebsocket(): Promise<void> {
    this.websocket = new WebSocket("/ws");

    return new Promise((resolve, reject) => {
      this.websocket!.onopen = () => resolve();
      this.websocket!.onmessage = (event) => this.handleWebsocketMessage(event);
      this.websocket!.onerror = reject;
    })
  }

  handleWebsocketMessage(messageEvent: MessageEvent<string>) {
    const message: WebsocketMessage = JSON.parse(messageEvent.data);

    switch (message.type) {
      case MessageType.CONNECT: {
        this.onConnect?.();
        break;
      }
      case MessageType.JOIN: {
        this.onPlayerJoin?.(<Player>message.data);
        break;
      }
      case MessageType.MESSAGE: {
        const data = <{ from: Player, message: string }>message.data;
        this.onMessage?.(data.from, data.message);
        break;
      }
      case MessageType.CHAINS: {
        this.onChains?.(<Chain[]>message.data);
        break;
      }

      case MessageType.QUESTION: {
        const data = <{ chainID: UUID, question: string }>message.data;
        this.onQuestion?.(data.chainID, data.question);
        break;
      }
      case MessageType.ANSWER: {
        const data = <{ chainID: UUID, answer: string }>message.data;
        this.onAnswer?.(data.chainID, data.answer);
        break;
      }
      case MessageType.EDIT: {
        const data = <{ chainID: UUID, edit: string }>message.data;
        this.onEdit?.(data.chainID, data.edit);
        break;
      }

      case MessageType.CONTINUE:
      default: {
        console.error(`Message type ${message.type} not expected!`);
      }
    }
  }

  createNewRoom() {
    const code = Math.floor(Math.random() * (10 ** parseInt(PUBLIC_PIN_LENGTH))).toString();
    this.connectToWebsocket().then(() => {
      this.sendWebsocketMessage({ type: MessageType.CONNECT, data: { code: code, create: true } });
    });
    return code;
  }

  connectToRoom(code: string) {
    this.connectToWebsocket().then(() => {
      this.sendWebsocketMessage({ type: MessageType.CONNECT, data: { code: code, create: false } });
    })
  }

  sendWebsocketMessage(object: WebsocketMessage) {
    const data = JSON.stringify(object);
    this.websocket?.send(data);
  }

  // Senders
  sendSelf(self: Player) {
    this.sendWebsocketMessage({ type: MessageType.JOIN, data: self })
  }

  sendMessage(self: Player, message: string) {
    this.sendWebsocketMessage({ type: MessageType.MESSAGE, data: { from: self, message: message } })
  }

  sendChains(chains: Chain[]) {
    this.sendWebsocketMessage({ type: MessageType.CHAINS, data: chains })
  }

  sendQuestion(chainID: UUID, question: string) {
    this.sendWebsocketMessage({ type: MessageType.QUESTION, data: { chainID, question } });
  }

  sendAnswer(chainID: UUID, answer: string) {
    this.sendWebsocketMessage({ type: MessageType.ANSWER, data: { chainID, answer } });
  }

  sendEdit(chainID: UUID, edit: string) {
    this.sendWebsocketMessage({ type: MessageType.EDIT, data: { chainID, edit } });
  }

  sendShow(chainID: UUID) { }




}
