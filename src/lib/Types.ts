export type UUID = string & { _uuidBrand : undefined }
export type NetworkID = string & { _networkIdBrand : undefined }

export type Player = {
  networkId : NetworkID;
  name : string;
}

export type Chain = {
  question : Message;
  answer : Message;
  edit : Message;
}

export type Message = {
  from : Player; // This should be a "User" type later
  myself : boolean;
  text? : string;
}

export enum CurrentState {
  DISCONNECTED,
  LOBBY,
  QUESTION,
  ANSWER,
  EDIT,
  VIEW
}

