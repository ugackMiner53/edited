import { type Player, type Chain, type UUID } from "$lib/Types";

/**
* Generic interface for all NetworkManager types
*/
export default interface AbstractNetworkManager {
  createNewRoom(): string;
  connectToRoom(roomPIN: string): void;
  sendMessage(self: Player, message: string): void;

  // Senders
  sendSelf(self: Player): void;
  sendPlayers(players: Player[]): void;
  sendChains(chains: Chain[]) : void;
  sendQuestion(chainID: UUID, question: string): void;
  sendAnswer(chainID: UUID, answer: string): void;
  sendEdit(chainID: UUID, edit: string): void;
  sendShow(chainID: UUID): void;
  sendLobby(): void;

  // Recievers
  onConnect?: () => void;
  onPlayers?: (players: Player[]) => void;
  onPlayerJoin?: (player: Player) => void;
  onMessage?: (player: Player, message: string) => void;
  onChains?: (chains: Chain[]) => void;
  onQuestion?: (chainID: UUID, question: string) => void;
  onAnswer?: (chainID: UUID, answer: string) => void;
  onEdit?: (chainID: UUID, edit: string) => void;
  onShow?: (chainID: UUID) => void;
  onLobby?: () => void;
  onPlayerLeave?: (player: Player) => void;

}

export enum MessageType {
  CONNECT,
  DISCONNECT,
  JOIN,
  PLAYERS,
  MESSAGE,
  CHAINS,
  QUESTION,
  ANSWER,
  EDIT,
  SHOW,
  LOBBY
}
