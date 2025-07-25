import { PUBLIC_ADAPTER } from "$env/static/public";
import { v6 as uuidv6 } from "uuid";

import type AbstractNetworkManager from "$lib/network/NetworkManager";
import WebsocketManager from "$lib/network/WebsocketManager";
import { CurrentState, type Player, type Message, type UUID, type Chain, KeyboardState } from "$lib/Types";
import TrysteroManager from "$lib/network/TrysteroManager";

export let currentState = $state({ state: CurrentState.DISCONNECTED });
export const gcState = $state({ name: "Edited Game", keyboardState: KeyboardState.SHOWN, enableKeyboard: true })

let networkManager: AbstractNetworkManager;
let hosting = false;
let gameCode: string;
export const myPlayer: Player = { uuid: <UUID>uuidv6(), name: "" }

let players: Player[] = [myPlayer];
let chains = new Map<UUID, Chain>();
let finishedChains = 0;
let myChains: Chain[];
let currentChain: null | Chain;

export const messages: Message[] = $state([
  <Message>{ text: "Enter your name to start" }
]);


export function handleMessage(message: string) {

  switch (currentState.state) {

    case CurrentState.DISCONNECTED: {

      sendLocalMessage(message);

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
      sendLocalMessage(message);

      // Try to start the lobby if we're hosting.
      if (message.toUpperCase() == "START" && hosting) {
        if (players.length > 2) {
          // Start the game
          chains.clear();
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
      sendLocalMessage(message);
      gcState.keyboardState = KeyboardState.BUTTON;
      if (currentChain?.chainId) networkManager.sendQuestion(currentChain.chainId, message);
      if (currentChain) currentChain.question.text = message;
      break;
    }

    case CurrentState.ANSWER: {
      sendLocalMessage(message);
      gcState.keyboardState = KeyboardState.BUTTON;
      if (currentChain?.chainId) networkManager.sendAnswer(currentChain.chainId, message);
      if (currentChain) currentChain.answer.text = message;
      break;
    }

    case CurrentState.EDIT: {
      messages[1].text = message;
      gcState.keyboardState = KeyboardState.BUTTON;
      if (currentChain?.chainId) networkManager.sendEdit(currentChain.chainId, message);
      if (currentChain) currentChain.edit.text = message;
      finishedChains++;
      checkChainsFinished();
      break;
    }

    case CurrentState.WAIT: {
      sendLocalMessage(message);
      networkManager.sendMessage(myPlayer, message);
      break;
    }

    default: {
      console.error(`Invalid message ${message} sent during ${currentState.state} state!`);
    }
  }
}


// All this does is push a message **from myself** to the chat.
function sendLocalMessage(message: string) {
  messages.push({
    from: myPlayer,
    text: message
  });
}


// Connect to the server given a lobby code.
function connectToServer(code: string) {

  if (code.startsWith('T') || PUBLIC_ADAPTER == "trystero") {
    // Try connecting via trystero
    networkManager = new TrysteroManager();
  } else if (PUBLIC_ADAPTER == "websocket") {
    // Try connecting via websocket
    networkManager = new WebsocketManager();
  } else {
    throw Error(`Adapter type ${PUBLIC_ADAPTER} not implemented!`);
  }

  if (code.toUpperCase().includes("CREATE")) {
    gameCode = networkManager.createNewRoom();
    hosting = true;
  } else {
    networkManager.connectToRoom(code);
    gameCode = code;
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
    currentState.state = CurrentState.LOBBY;

    messages.push(
      { text: `Connected to lobby ${gameCode}` }
    );

    if (hosting) {
      messages.push(
        { text: "You're hosting the lobby! To start the game, text START, or text CONFIG to edit the settings.", from: <Player>{ name: "System" } }
      );
    }
    updateGCState();
  }

  // When someone else joins, store and display message.
  networkManager.onPlayerJoin = (newPlayer) => {
    players.push(newPlayer);

    if (currentState.state == CurrentState.LOBBY) {
      messages.push(
        { text: `${newPlayer.name} joined the group chat` }
      );
    }

    if (hosting) {
      console.log("Sending players to clients!");
      networkManager.sendPlayers(players);
    }
  }

  networkManager.onPlayers = (remotePlayers) => {
    if (!hosting) {
      console.log(`Updating players from host!`);
      players = remotePlayers;
      console.log(players)
    }
  }

  // When sending a lobby message, display message.
  networkManager.onMessage = (player, message) => {
    if (currentState.state == CurrentState.LOBBY || currentState.state == CurrentState.WAIT) {
      messages.push(
        { from: player, text: message }
      );
    }
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
    console.log(`RECIEVED ${message} for chain ${chainId} which ${chains.has(chainId) ? 'does' : 'doesn\'t'} exist`)
    finishedChains++;
    checkChainsFinished();
  }

  networkManager.onShow = (chainId) => {
    if (!chains.has(chainId)) return;
    console.log(`Host says to show chain ${chainId}`);
    const chain = chains.get(chainId)!;
    gcState.keyboardState = KeyboardState.NONE;
    showChainAnimation(chain);
  }

  networkManager.onLobby = () => {
    chains.clear();
    myChains = [];
    currentChain = null;
    finishedChains = 0;
    currentState.state = CurrentState.LOBBY;
    updateGCState();
  }

  networkManager.onPlayerLeave = (player) => {
    console.log(`Server says that ${player.name} left game...`);
    // const playerIndex = players.indexOf(player);
    const playerIndex = players.findIndex(knownPlayer => knownPlayer.uuid === player.uuid);
    console.log(`Their player index was ${playerIndex}`);
    if (playerIndex != -1) {
      players.splice(playerIndex, 1);
      console.log(`Removed ${player.name} from player list!`);
    } else {
      console.log("But I've never heard of them before!");
    }

    if (currentState.state == CurrentState.LOBBY || currentState.state == CurrentState.WAIT) {
      messages.push({ text: `${player.name} left the group chat` });
    }

    if (playerIndex == 0) {
      console.warn("oh no, because player index == 0, that was probably the host who left");

      // Try to determine new host based on uuid
      players.sort((a, b) => (a.uuid < b.uuid) ? -1 : (a.uuid > b.uuid) ? 1 : 0);

      // The new first player becomes the host
      if (players[0].uuid == myPlayer.uuid) {
        hosting = true;
        messages.push(
          { text: "You're the new host!" }
        );
        updateGCState();
      }
      
    }

  }
}


export function nextChain() {

  if (myChains.length > 0) {
    currentChain = myChains.shift()!;
  } else {
    currentChain = null;
  }


  if (currentState.state == CurrentState.VIEW && hosting) {
    if (currentChain != null) {
      gcState.keyboardState = KeyboardState.NONE;
      networkManager.sendShow(currentChain.chainId);
      showChainAnimation(currentChain);
    } else {
      networkManager.sendLobby();
      currentState.state = CurrentState.LOBBY;
      updateGCState();
    }
    return;
  }

  if (currentState.state == CurrentState.EDIT) {
    messages.length = 0;
    messages.push({ text: "Welcome back to the lobby. The game will continue when everyone finishes." });
    currentState.state = CurrentState.WAIT;
    updateGCState();
    return;
  }

  currentState.state++;
  gcState.keyboardState = KeyboardState.SHOWN;
  updateMessages();
}

async function showChainAnimation(chain: Chain) {
  messages.push(chain.question)
  await new Promise(f => setTimeout(f, 2000));
  messages[messages.length - 1] = { from: chain.question.from, text: chain.edit.text, originalText: chain.question.text };
  await new Promise(f => setTimeout(f, 3000));
  messages.push(chain.answer);
  await new Promise(f => setTimeout(f, 300));

  if (hosting) {
    gcState.keyboardState = KeyboardState.BUTTON;
  }
}

function updateMessages() {
  messages.length = 0;

  switch (currentState.state) {
    case CurrentState.QUESTION: {
      messages.push({ text: `Ask ${currentChain?.answer.from?.name ?? "them"} a question!` })
      break;
    }
    case CurrentState.ANSWER: {
      messages.push({ text: `Answer ${currentChain?.question.from?.name ?? "the sender"}'s question!` })
      break;
    }
    case CurrentState.EDIT: {
      messages.push({ text: `Replace ${currentChain?.question.from?.name}'s question to make ${currentChain?.answer.from?.name} look bad!` })
      break;
    }
  }

  if (currentChain?.question.text) messages.push(currentChain.question);
  if (currentChain?.answer.text) messages.push(currentChain.answer);

  updateGCState();
}

function updateGCState() {

  switch (currentState.state) {
    case CurrentState.QUESTION: {
      if (!currentChain) return;
      gcState.name = currentChain.answer.from!.name;
      break;
    }

    case CurrentState.ANSWER: {
      if (!currentChain) return;
      gcState.name = currentChain.question.from!.name;
      gcState.enableKeyboard = currentChain.question.text != null;
      break;
    }

    case CurrentState.EDIT: {
      if (!currentChain) return;
      gcState.name = `${currentChain.question.from!.name} & ${currentChain.answer.from!.name}`;
      gcState.enableKeyboard = currentChain.question.text != null && currentChain.answer.text != null;
      break;
    }

    case CurrentState.LOBBY:
    case CurrentState.WAIT: {
      gcState.name = `Lobby ${gameCode}`;
      gcState.keyboardState = KeyboardState.SHOWN;
      gcState.enableKeyboard = true;
      break;
    }

    case CurrentState.VIEW: {
      gcState.name = `Lobby ${gameCode}`;
      gcState.enableKeyboard = false;
      if (hosting) {
        gcState.keyboardState = KeyboardState.BUTTON;
      } else {
        gcState.keyboardState = KeyboardState.NONE;
      }
      break;
    }
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
  finishedChains = 0;
  currentState.state = CurrentState.QUESTION;
  updateMessages();
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

function checkChainsFinished() {
  if (finishedChains >= chains.size) {
    console.log("CHAINS FINISHED")
    // Game has finished
    currentState.state = CurrentState.VIEW;
    messages.length = 0;
    messages.push({ text: "Now revealing messages" });
    myChains = Array.from(chains.values());
    updateGCState();
    // myChains.sort((a, b) => a.chainId >= b.chainId ? 1 : -1);
  }
}
