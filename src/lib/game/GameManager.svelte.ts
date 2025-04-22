import { PUBLIC_ADAPTER } from "$env/static/public";
import { v6 as uuidv6 } from "uuid";

import type AbstractNetworkManager from "$lib/network/NetworkManager";
import WebsocketManager from "$lib/network/WebsocketManager";
import { CurrentState, type Player, type Message, type UUID, type Chain } from "$lib/Types";

export let currentState = CurrentState.DISCONNECTED;
export const gcState = $state({ name: "Edited Game", showKeyboard: true, enableKeyboard: true })

let networkManager: AbstractNetworkManager;
let hosting = false;
let gameCode: string;
export const myPlayer: Player = { uuid: <UUID>uuidv6(), name: "" }

// This is only really important for the host to know, clients can desync on this
const players: Player[] = [myPlayer];

let chains = new Map<UUID, Chain>();
let myChains: Chain[];
let currentChain: null | Chain;

export const messages: Message[] = $state([
  <Message>{ text: "Enter your name to start" }
]);


export function handleMessage(message: string) {

  switch (currentState) {

    case CurrentState.DISCONNECTED: {

      addMessage(message);

      // If this is the first message, it should become the player's name.
      if (myPlayer.name == "") {
        myPlayer.name = message;
        messages.length = 0;
        messages.push(
          { from: <Player>{ name: "System" }, text: "Welcome to Edited! Text a game code to join it, or type CREATE to make your own lobby." }
        );
        return;
      }


      // If anyone is complaining about green bubbles, let them know about trystero.
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

      // Try to start the lobby if we're hosting.
      if (message.toUpperCase() == "START" && hosting) {
        if (players.length > 2) {
          // Start the game
          const newChains = createChains();
          handleChains(newChains)
          networkManager.sendChains(newChains);
        } else {
          messages.push(
            { from: <Player>{ name: "System" }, text: `You need more players to start! You currently have ${players.length}/3 players in your lobby!` }
          );
        }
        return;
      }

      networkManager.sendMessage(myPlayer, message);
      break;
    }

    case CurrentState.QUESTION: {
      addMessage(message);
      gcState.showKeyboard = false;
      if (currentChain?.chainId) networkManager.sendQuestion(currentChain.chainId, message);
      break;
    }

    case CurrentState.ANSWER: {
      addMessage(message);
      gcState.showKeyboard = false;
      if (currentChain?.chainId) networkManager.sendAnswer(currentChain.chainId, message);
      break;
    }

    case CurrentState.EDIT: {
      messages[0].text = message;
      gcState.showKeyboard = false;
      if (currentChain?.chainId) networkManager.sendEdit(currentChain.chainId, message);
      break;
    }

    default: {
      console.error(`Invalid message ${message} sent during ${currentState} state!`);
    }
  }
}


// All this does is push a message **from myself** to the chat.
function addMessage(message: string) {
  messages.push({
    from: myPlayer,
    text: message
  });
}


// Connect to the server given a lobby code.
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


// Add event listeners to the different server events.
function bindServerFunctions() {
  if (!networkManager) return;

  // When connected, show introductions and send self object.
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

  // When someone else joins, store and display message.
  networkManager.onPlayerJoin = (newPlayer) => {
    players.push(newPlayer);

    if (currentState == CurrentState.LOBBY) {
      messages.push(
        { text: `${newPlayer.name} joined the group chat` }
      );
    }
  }

  // When sending a lobby message, display message.
  networkManager.onMessage = (player, message) => {
    messages.push(
      { from: player, text: message }
    );
  }

  // Callback for creating chains when recieving from host.
  networkManager.onChains = handleChains;

  // When anyone submits a question, update that chain accordingly.
  networkManager.onQuestion = (chainId, message) => {
    if (chains.has(chainId)) chains.get(chainId)!.question.text = message;
    if (chainId === currentChain?.chainId) updateMessages();
  }

  // When anyone submits an answer, update that chain accordingly.
  networkManager.onAnswer = (chainId, message) => {
    if (chains.has(chainId)) chains.get(chainId)!.answer.text = message;
    if (chainId === currentChain?.chainId) updateMessages();
  }

  // When anyone submits an edit, update that chain accordingly.
  networkManager.onEdit = (chainId, message) => {
    if (chains.has(chainId)) chains.get(chainId)!.edit.text = message;
    if (chainId === currentChain?.chainId) updateMessages();
  }
}


export function nextChain() {
  if (myChains.length > 0) {
    currentChain = myChains.shift()!;
  }

  currentState++;
  gcState.showKeyboard = true;
  updateMessages();
}


function updateMessages() {
  messages.length = 0;
  if (currentChain?.question.text) messages.push(currentChain.question);
  if (currentChain?.answer.text) messages.push(currentChain.answer);
  updateGCState();
}

function updateGCState() {
  
  if (!currentChain) return;

  if (currentState == CurrentState.QUESTION) gcState.name = currentChain.answer.from!.name;
  
  if (currentState == CurrentState.ANSWER) {
    gcState.name = currentChain.question.from!.name;
    gcState.enableKeyboard = currentChain.question.text != null;
  }
  
  if (currentState == CurrentState.EDIT) {
    gcState.name = `${currentChain.question.from!.name} & ${currentChain.answer.from!.name}`;
    gcState.enableKeyboard = currentChain.question.text != null && currentChain.answer.text != null;
  }
}

// Function for the host to create the different chains.
function createChains(): Chain[] {

  const chains: Chain[] = Array.from({ length: players.length }, () => {
    return {
      chainId: <UUID>uuidv6(),
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


// When raw chains are recieved, convert array to map and filter out my chains.
function handleChains(newChains: Chain[]) {
  newChains.forEach(chain => {
    chains.set(chain.chainId, chain);
  })
  myChains = findMyChains(newChains);
  currentChain = myChains.shift()!;
  console.log(`Starting chain is ${currentChain.chainId}`);
  currentState = CurrentState.QUESTION;
  messages.length = 0;
  updateGCState();
}


// Find the chains that I am participating in.
function findMyChains(chains: Chain[]): Chain[] {
  const myChains = Array(3);
  chains.forEach(chain => {
    if (chain.question.from?.uuid == myPlayer.uuid) myChains[0] = chain;
    if (chain.answer.from?.uuid == myPlayer.uuid) myChains[1] = chain;
    if (chain.edit.from?.uuid == myPlayer.uuid) myChains[2] = chain;
  })
  return myChains;
}
