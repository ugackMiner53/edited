import { MessageType } from "$lib/network/NetworkManager";
import type { WebsocketMessage } from "$lib/network/WebsocketManager";
import { type Socket } from "@sveltejs/kit";

const roomCodes = new Set<string>();

export const socket: Socket = {

  async message(peer, message) {
    console.log(`I got message ${message}!`)

    const websocketMessage: WebsocketMessage = await message.json();

    if (websocketMessage.type == MessageType.CONNECT) {
      const data = <{ code: string, create: boolean }>websocketMessage.data;

      if (data.create) {
        if (roomCodes.has(data.code)) return;
        roomCodes.add(data.code);
      }

      console.log(`Joining ${peer} to room ${data.code}`);
      if (roomCodes.has(data.code)) {
        peer.subscribe(data.code);
        peer.context.room = data.code;
        peer.send(JSON.stringify({ type: MessageType.CONNECT }));
      }

      return;
    }

    peer.publish(<string>peer.context.room, message.text());

  }

  // Need some way to remove lobby codes from the list, otherwise we're going to run out
}
