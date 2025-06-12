import { browser } from "$app/environment";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";
import type { Player, Chain, UUID } from "$lib/Types";
import type AbstractNetworkManager from "./NetworkManager";
import { joinRoom, type Room, type ActionSender, type ActionReceiver, type DataPayload } from "trystero/torrent";

export default class TrysteroManager implements AbstractNetworkManager {

  appConfig = { appId: "gh-edited-game" }
  confirmedConnection = false;

  createNewRoom(): string {
    // Thanks https://stackoverflow.com/a/47496558 (CC BY-SA 4.0)
    const code = [...Array(parseInt(PUBLIC_PIN_LENGTH))].map(() => Math.random().toString(36)[2]).join('').toUpperCase() || "0";
    this.confirmedConnection = true;
    this.connectToRoom(code);
    Promise.resolve().then(() => {
      this.onConnect?.();
    });
    return code;
  }

  connectToRoom(roomPIN: string): void {
    if (!browser) return;
    const room = joinRoom(this.appConfig, roomPIN.toUpperCase());
    console.log(`Connected to room ${roomPIN}`);
    this.bindTrysteroFunctions(room);
  }

  bindTrysteroFunctions(room : Room): void {
    // 1. Create an action pair of sender and reciever
    // 2. Set the class sender to wrap the action sender
    // 3. Make the action reciever wrap a call to the class reciever

    const _self = room.makeAction("self");
    this.sendSelf = (self) => _self[0]({player: self});
    _self[1]((data) => this.onPlayerJoin?.((<{player: Player}>data).player));

    const _message = room.makeAction("message");
    this.sendMessage = (self, message) => _message[0]({from: self, message});
    _message[1]((data) => this.onMessage?.((<{from: Player}>data).from, (<{message: string}>data).message));

    const _players = room.makeAction("players");
    this.sendPlayers = (players) => _players[0]({players});
    _players[1]((data) => this.onPlayers?.((<{players: Player[]}>data).players));

    const _chains = room.makeAction("chains");
    this.sendChains = (chains) => _chains[0]({chains});
    _chains[1]((data) => this.onChains?.((<{chains: Chain[]}>data).chains));

    const _question = room.makeAction("question");
    this.sendQuestion = (chainID, question) => _question[0]({chainID, question});
    _question[1]((data) => this.onQuestion?.((<{chainID: UUID}>data).chainID, (<{question: string}>data).question));

    const _answer = room.makeAction("answer");
    this.sendAnswer = (chainID, answer) => _answer[0]({chainID, answer});
    _answer[1]((data) => this.onAnswer?.((<{chainID: UUID}>data).chainID, (<{answer: string}>data).answer));

    const _edit = room.makeAction("edit");
    this.sendEdit = (chainID, edit) => _edit[0]({chainID, edit});
    _edit[1]((data) => this.onEdit?.((<{chainID: UUID}>data).chainID, (<{edit: string}>data).edit));

    const _show = room.makeAction("show");
    this.sendShow = (chainID) => _show[0]({chainID});
    _show[1]((data) => this.onShow?.((<{chainID: UUID}>data).chainID));

    const _lobby = room.makeAction("lobby");
    this.sendLobby = () => _lobby[0](null);
    _lobby[1](() => this.onLobby?.());

    room.onPeerJoin(() => {
      if (!this.confirmedConnection) {
        console.log(`Peer joined! Calling onConnect`);
        this.confirmedConnection = true;
        this.onConnect?.();
      }
    })
  }

  sendSelf(self: Player) {};
  sendMessage(self: Player, message: string) {};
  sendPlayers(players: Player[]) {};
  sendChains(chains: Chain[]) {};
  sendQuestion(chainID: UUID, question: string) {};
  sendAnswer(chainID: UUID, answer: string) {};
  sendEdit(chainID: UUID, edit: string) {};
  sendShow(chainID: UUID) {};
  sendLobby() {};

  onConnect?: (() => void) | undefined;
  onPlayers?: ((players: Player[]) => void) | undefined;
  onPlayerJoin?: ((player: Player) => void) | undefined;
  onMessage?: ((player: Player, message: string) => void) | undefined;
  onChains?: ((chains: Chain[]) => void) | undefined;
  onQuestion?: ((chainID: UUID, question: string) => void) | undefined;
  onAnswer?: ((chainID: UUID, answer: string) => void) | undefined;
  onEdit?: ((chainID: UUID, edit: string) => void) | undefined;
  onShow?: ((chainID: UUID) => void) | undefined;
  onLobby?: (() => void) | undefined;
  onPlayerLeave?: ((player: Player) => void) | undefined;

}
