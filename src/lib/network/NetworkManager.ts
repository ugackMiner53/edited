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
  sendChains(chains: Chain[]) : void;
  sendQuestion(chainID: UUID, question: string): void;
  sendAnswer(chainID: UUID, answer: string): void;
  sendEdit(chainID: UUID, edit: string): void;
  sendShow(chainID: UUID): void;

  // Recievers
  onConnect?: () => void;
  onPlayerJoin?: (player: Player) => void;
  onMessage?: (player: Player, message: string) => void;
  onChains?: (chains: Chain[]) => void;
  onQuestion?: (chainID: UUID, question: string) => void;
  onAnswer?: (chainID: UUID, answer: string) => void;
  onEdit?: (chainID: UUID, edit: string) => void;
  onShow?: (chainID: UUID) => void;
  onPlayerLeave?: (player: Player) => void;

}

export enum MessageType {
  CONNECT,
  JOIN,
  MESSAGE,
  CHAINS,
  QUESTION,
  ANSWER,
  EDIT,
  CONTINUE
}
