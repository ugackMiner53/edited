import { type Player, type Chain, type UUID } from "$lib/Types";

/**
* Generic interface for all NetworkManager types
*/
export default interface AbstractNetworkManager {
  createNewRoom(): string;
  connectToRoom(roomPIN: string): void;
  sendMessage(message: string): void;

  // Senders
  sendSelf(self: Player): void;
  sendQuestion(chainID: UUID, question: string): void;
  sendAnswer(chainID: UUID, question: string): void;
  sendEdit(chainID: UUID, question: string): void;
  sendShow(chainID: UUID): void;

  // Recievers
  onPlayerJoin?: (player: Player) => void;
  onChains?: (chains: Chain[]) => void;
  onQuestion?: (chainID: UUID, question: string) => void;
  onAnswer?: (chainID: UUID, answer: string) => void;
  onEdit?: (chainID: UUID, edit: string) => void;
  onShow?: (chainID: UUID) => void;
  onPlayerLeave?: (player: Player) => void;

}

export enum MessageType {
  JOIN,
  QUESTION,
  ANSWER,
  EDIT,
  CONTINUE
}
