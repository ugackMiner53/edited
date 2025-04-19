export default class Lobby {

  code : number;
  
  players: unknown[] = []; // Should be player[]
  
  constructor() {
    this.code = Math.floor(Math.random()*100000);
    console.log(`Created lobby with pin ${this.code}`);
  }

  
  
}
