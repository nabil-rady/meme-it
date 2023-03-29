import { v4 as uuid } from "uuid";
import { Player } from "./Player";
import {
  GameInfo,
  GameResponse,
  PlayerInfo,
  TerminateResponse,
} from "../types";

export class Game {
  private readonly id: string;
  private rounds: number;
  private maxPlayers: number;
  private players: Player[];

  constructor(rounds: number, maxPlayers: number, admin: Player) {
    this.id = uuid();
    this.rounds = rounds;
    this.maxPlayers = maxPlayers;
    this.players = [admin];
  }

  getGameId(): string {
    return this.id;
  }

  getGameInfo(): GameInfo {
    return {
      id: this.id,
      rounds: this.rounds,
      maxPlayers: this.maxPlayers,
    };
  }

  getPlayersInfos(): PlayerInfo[] {
    return this.players.map((player) => ({
      ...player.getPlayerInfo(),
    }));
  }

  getAdmin(): Player | undefined {
    return this.players.find((player) => player.isAdmin());
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getEarliestPlayer(): Player | undefined {
    if (this.players.length === 0) return undefined;
    return this.players.reduce(
      (earliestPlayer: Player, currentPlayer: Player) =>
        earliestPlayer.getPlayerInfo().joinedAt <
        currentPlayer.getPlayerInfo().joinedAt
          ? earliestPlayer
          : currentPlayer
    );
  }

  setGameInfo(game: GameInfo) {
    this.maxPlayers = game.maxPlayers;
    this.rounds = game.rounds;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(playerToBeRemoved: Player) {
    this.players = this.players.filter(
      (player) => player.getPlayerId() !== playerToBeRemoved.getPlayerId()
    );
  }

  broadcast(response: GameResponse) {
    for (const player of this.players) {
      player.send(response);
    }
  }

  terminate() {
    const terminateResponse: TerminateResponse = {
      method: "terminate",
    };

    for (const player of this.players) {
      player.send(terminateResponse);
    }
  }
}
