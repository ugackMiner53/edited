import { MessageType } from "$lib/network/NetworkManager";
import type { WebsocketMessage } from "$lib/network/WebsocketManager";
import type { Player } from "$lib/Types";
import { type Socket } from "@sveltejs/kit";

const roomCodes = new Map<string, number>();

export const socket: Socket = {

  async message(peer, message) {
    const websocketMessage: WebsocketMessage = await message.json();

    if (websocketMessage.type == MessageType.CONNECT) {
      const data = <{ code: string, create: boolean }>websocketMessage.data;

      if (data.create) {
        if (roomCodes.has(data.code)) return;
        console.log(`Created room with code ${data.code}`);
        roomCodes.set(data.code, 0);
      }

      console.log(`Joining ${peer} to room ${data.code}`);
      if (roomCodes.has(data.code)) {
        peer.subscribe(data.code);
        peer.context.room = data.code;
        peer.send(JSON.stringify({ type: MessageType.CONNECT }));
        roomCodes.set(data.code, (roomCodes.get(data.code) ?? 0) + 1);
      }

      return;
    }

    if (websocketMessage.type == MessageType.JOIN) {
      peer.context.player = <Player>websocketMessage.data;
    }

    peer.publish(<string>peer.context.room, message.text());

  },

  async close(peer, details) {
    if (peer.context.room) {
      peer.publish(<string>peer.context.room, JSON.stringify({ type: MessageType.DISCONNECT, data: peer.context.player }));
      console.log(`Client ${peer} (${(<Player|undefined>peer.context.player)?.name}) left room ${peer.context.room}`);

      const leftoverPeople = roomCodes.get(<string>peer.context.room)! - 1;
      console.log(`There are ${leftoverPeople} left in the room!`);
      if (leftoverPeople > 0) {
        roomCodes.set(<string>peer.context.room, leftoverPeople);
      } else {
        console.log(`Deleting room ${peer.context.room} becuase there are no more players!`);
        roomCodes.delete(<string>peer.context.room);
      }
    } else {
      console.log(`Client ${peer} left because ${details.reason}`);
    }


    

  }

  // Need some way to remove lobby codes from the list, otherwise we're going to run out
}
