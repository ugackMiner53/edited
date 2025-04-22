import { PUBLIC_ADAPTER } from "$env/static/public";
import { v6 as uuidv6 } from "uuid";

import type AbstractNetworkManager from "$lib/network/NetworkManager";
import WebsocketManager from "$lib/network/WebsocketManager";
import { CurrentState, type Player, type Message, type UUID, type Chain } from "$lib/Types";

export let currentState = CurrentState.DISCONNECTED;
export const gcState = $state({ name: "Edited Game" })

let networkManager: AbstractNetworkManager;
let hosting = false;
let gameCode: string;
export const myPlayer: Player = { uuid: <UUID>uuidv6(), name: "" }

// This is only really important for the host to know, clients can desync on this
const players: Player[] = [myPlayer];

let chains: Chain[] = [];

let currentChain: unknown = null;


export const messages: Message[] = $state([
  <Message>{ text: "Enter your name to start" }
]);

export function handleMessage(message: string) {

  switch (currentState) {
    case CurrentState.DISCONNECTED: {

      if (myPlayer.name == "") {
        myPlayer.name = message;
        messages.pop();
        messages.push(
          { from: <Player>{ name: "System" }, text: "Welcome to Edited! Text a game code to join it, or type CREATE to make your own lobby." }
        );
        return;
      }

      addMessage(message);

      if (message.toLowerCase().includes("green") && PUBLIC_ADAPTER == "trystero") {
        messages.push(
          { from: <Player>{ name: "System" }, text: "You're seeing green bubbles because you're connecting via trystero, a peer-to-peer networking solution. If you'd like blue bubbles and better connections, try hosting Edited yourself!" }
        );
        return;
      }

      connectToServer(message);
      break;
    }
    case CurrentState.LOBBY: {
      // Send message to group in lobby
      addMessage(message);

      if (message.toUpperCase() == "START") {
        if (players.length > 2) {
          // Start the game
          chains = createChains();
          networkManager.sendChains(chains);
        } else {
          messages.push(
            { from: <Player>{ name: "System" }, text: `You need more players to start! You currently have ${players.length}/3 players in your lobby!` }
          );
        }
        return;
      }

      networkManager.sendMessage(myPlayer, message);
    }
    default: {
      console.error(`Invalid message ${message} sent during ${currentState} state!`);
    }
  }
}

function addMessage(message: string) {
  messages.push({
    from: myPlayer,
    text: message
  });
}

function connectToServer(code: string) {

  if (code.startsWith('T') || PUBLIC_ADAPTER == "trystero") {
    // Try connecting via trystero
  } else if (PUBLIC_ADAPTER == "websocket") {
    // Try connecting via websocket
    networkManager = new WebsocketManager();

    if (code.toUpperCase() == "CREATE") {
      gameCode = networkManager.createNewRoom();
      hosting = true;
    } else if (!Number.isNaN(parseInt(code))) { // Remove this check if you want codes to not be just numbers
      networkManager.connectToRoom(code);
      gameCode = code;
    }
  } else {
    throw Error("Cannot connect with trystero or websockets")
  }

  bindServerFunctions();
}

function bindServerFunctions() {
  if (!networkManager) return;

  networkManager.onConnect = () => {
    console.log("Trying to send self")
    networkManager.sendSelf(myPlayer);
    currentState = CurrentState.LOBBY;

    messages.push(
      { text: `Connected to lobby ${gameCode}` }
    );

    if (hosting) {
      messages.push(
        { text: "You're hosting the lobby! To start the game, text START, or text CONFIG to edit the settings.", from: <Player>{ name: "System" } }
      );
    }
    gcState.name = `Lobby ${gameCode}`;
  }

  networkManager.onPlayerJoin = (newPlayer) => {
    players.push(newPlayer);

    if (currentState == CurrentState.LOBBY) {
      messages.push(
        { text: `${newPlayer.name} joined the group chat` }
      );
    }
  }

  networkManager.onMessage = (player, message) => {
    console.log(`Recieved message from ${player.name} called ${message}`);
    messages.push(
      { from: player, text: message }
    );
  }

  networkManager.onChains = (remoteChains) => {
    chains = remoteChains;
    currentState = CurrentState.QUESTION;
    console.log("RECIEVED CHAINS!")
    console.log(chains);
    // currentChain 
    // Get current chain here
  }

}


function createChains(): Chain[] {

  const chains: Chain[] = Array.from({ length: players.length }, () => {
    return {
      question: {},
      answer: {},
      edit: {}
    }
  });

  // Fischer-Yates true random shuffle
  for (let i = players.length - 1; i > 0; i--) {
    const randIndex = Math.floor(Math.random() * (i + 1));
    const temp = players[randIndex];
    players[randIndex] = players[i];
    players[i] = temp;
  }

  const order: ("question" | "answer" | "edit")[] = ["question", "answer", "edit"]

  for (let i = 0; i <= 2; i++) {

    chains.forEach((chain, index) => {
      chain[order[i]].from = players[index];
    })

    // Shift array by one for next loop
    players.push(players.shift()!);
  }

  return chains;
}
