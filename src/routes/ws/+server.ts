import { type Socket } from "@sveltejs/kit";

export const socket: Socket = {
  open(peer) {
    peer.subscribe("topic");
    peer.send("Connected to server!");
  },

  message(peer, message) {
    console.log(`I got message ${message}!`)
    peer.send("I got your message: " + message.data);
  }
}
