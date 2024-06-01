import { v4 as uuid } from "uuid";
import { Player } from "./Player";
import {
  GamePhase,
  GameInfo,
  PlayerInfo,
  GameResponseBody,
  TerminateResponseBody,
} from "../types";

export class Game {
  private readonly id: string;
  private rounds: number;
  private maxPlayers: number;
  private phase: GamePhase;
  private players: Player[];
  private currentRound: number;
  private timeoudId: NodeJS.Timeout | undefined = undefined;

  constructor(rounds: number, maxPlayers: number, admin: Player) {
    this.id = uuid();
    this.rounds = rounds;
    this.maxPlayers = maxPlayers;
    this.phase = "lobby";
    this.players = [admin];
    this.currentRound = 1;
  }

  getGameId(): string {
    return this.id;
  }

  getGameInfo(): GameInfo {
    return {
      id: this.id,
      rounds: this.rounds,
      maxPlayers: this.maxPlayers,
      phase: this.phase,
      currentRound: this.currentRound,
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

  getActivePlayers(): Player[] {
    return this.players.filter((player) => player.getPlayerInfo().inGame);
  }

  getEarliestPlayer(): Player | undefined {
    if (this.getActivePlayers().length === 0) return undefined;
    return this.getActivePlayers().reduce(
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
    for (const player of this.players) {
      if (player.getPlayerId() === playerToBeRemoved.getPlayerId()) {
        player.leaveGame();
        break;
      }
    }
  }

  removeInactivePlayers() {
    this.players = this.players.filter(
      (player) => player.getPlayerInfo().inGame
    );
  }

  shufflePlayers() {
    for (let i = this.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
  }

  hasNoPlayers() {
    return this.players.every((player) => !player.getPlayerInfo().inGame);
  }

  incrementRound() {
    this.currentRound++;
  }

  getPhase(): GamePhase {
    return this.phase;
  }

  setPhase(phase: GamePhase) {
    this.phase = phase;
  }

  getTimeoutId(): NodeJS.Timeout | undefined {
    return this.timeoudId;
  }

  setTimeoutId(timeoudId: NodeJS.Timeout) {
    this.timeoudId = timeoudId;
  }

  restart() {
    this.phase = "lobby";
    this.currentRound = 1;

    this.removeInactivePlayers();
    for (const player of this.players) {
      player.reset();
    }
  }

  broadcast(response: GameResponseBody) {
    for (const player of this.players) {
      player.send(response);
    }
  }

  terminate() {
    const terminateResponse: TerminateResponseBody = {
      method: "terminate",
    };

    for (const player of this.players) {
      player.send(terminateResponse);
    }
  }
}
