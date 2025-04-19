import { PUBLIC_ADAPTER } from "$env/static/public";

import type AbstractNetworkManager from "$lib/network/NetworkManager";
import WebsocketManager from "$lib/network/WebsocketManager";
import { CurrentState, type Player, type Message, type UUID, type Chain } from "$lib/Types";

export let currentState = CurrentState.DISCONNECTED;
let serverManager: AbstractNetworkManager;
let hosting = false;
let gameCode: string;

// This is only really important for the host to know, clients can desync on this
const players: Player[] = [];

const chains: Chain[] = [];
const chainsToShow: UUID[] = [];

let currentChain: unknown = null;


export const messages: Message[] = $state([
  <Message>{ from: { name: "System" }, myself: false, text: "Welcome to Edited! Text a game code to join it, or type CREATE to make your own lobby." }
]);

export function handleMessage(message: string) {

  switch (currentState) {
    case CurrentState.DISCONNECTED: {
      // Try to connect to the lobby code (if specified)
      addMessage(message);
      connectToServer(message);
      break;
    }
    case CurrentState.LOBBY: {
      // Send message to group in lobby
      addMessage(message);
      serverManager.sendMessage(message);
    }
    default: {
      console.error(`Invalid message ${message} sent during ${currentState} state!`);
    }
  }
}

function addMessage(message: string) {
  messages.push({
    from: <Player>{},
    myself: true,
    text: message
  });
}

function connectToServer(code: string) {

  if (code.startsWith('T') || PUBLIC_ADAPTER == "trystero") {
    // Try connecting via trystero
  } else if (PUBLIC_ADAPTER == "websocket") {
    // Try connecting via websocket
    serverManager = new WebsocketManager();

    if (code.toUpperCase() == "CREATE") {
      gameCode = serverManager.createNewRoom();
    } else {
      serverManager.connectToRoom(code);
      gameCode = code;
    }
  } else {
    throw Error("Cannot connect with trystero or websockets")
  }
}
