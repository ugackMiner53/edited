import { PUBLIC_ADAPTER } from "$env/static/public";
import { v6 as uuidv6 } from "uuid";

import type AbstractNetworkManager from "$lib/network/NetworkManager";
import WebsocketManager from "$lib/network/WebsocketManager";
import { CurrentState, type Player, type Message, type UUID, type Chain } from "$lib/Types";

export let currentState = CurrentState.DISCONNECTED;
let serverManager: AbstractNetworkManager;
let hosting = false;
let gameCode: string;
const myPlayer : Player = {uuid: <UUID>uuidv6(), name: ""}

// This is only really important for the host to know, clients can desync on this
const players: Player[] = [];

const chains: Chain[] = [];
const chainsToShow: UUID[] = [];

let currentChain: unknown = null;


export const messages: Message[] = $state([
  <Message>{ myself: false, text: "Enter your name to start" }
]);

export function handleMessage(message: string) {

  switch (currentState) {
    case CurrentState.DISCONNECTED: {

      if (myPlayer.name == "") {
        myPlayer.name = message;
        messages.pop();
        messages.push(
          <Message>{ from: {name: "System"}, myself: false, text: "Welcome to Edited! Text a game code to join it, or type CREATE to make your own lobby." }
        );
        return;
      }

      addMessage(message);      

      if (message.toLowerCase().includes("green") && PUBLIC_ADAPTER == "trystero") {
        messages.push(
          <Message>{ from: { name: "System" }, myself: false, text: "You're seeing green bubbles because you're connecting via trystero, a peer-to-peer networking solution. If you'd like blue bubbles and better connections, try hosting Edited yourself!" }
        );
        return;
      }

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
    } else if (!Number.isNaN(parseInt(code))) { // Remove this check if you want codes to not be just numbers
      serverManager.connectToRoom(code);
      gameCode = code;
    }
  } else {
    throw Error("Cannot connect with trystero or websockets")
  }

  bindServerFunctions();
}

function bindServerFunctions() {
  if (!serverManager) return;

  serverManager.onConnect = () => {
    console.log("Trying to send self")
    serverManager.sendSelf(myPlayer);
  }

  serverManager.onPlayerJoin = (newPlayer) => {
    players.push(newPlayer);

    if (currentState == CurrentState.LOBBY) {
      messages.push(
        { myself: false, text: `${newPlayer.name} joined the group chat` }
      );
    }
  }

}

