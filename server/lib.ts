import { v4 as uuid } from "uuid";
import {
  GameConnection,
  GameResponse,
  TerminateResponse,
  PlayerInfo,
  GameInfo,
} from "./types";

export class Player {
  private readonly id: string;
  private nickname: string;
  private avatar: string;
  private admin: boolean;
  private readonly joinedAt: number;
  private readonly connection: GameConnection;

  constructor(
    nickname: string,
    avatar: string,
    admin: boolean,
    connection: GameConnection
  ) {
    this.id = uuid();
    this.nickname = nickname;
    this.avatar = avatar;
    this.admin = admin;
    this.joinedAt = Date.now().valueOf();
    this.connection = connection;
  }

  getPlayerId(): string {
    return this.id;
  }

  getPlayerInfo(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      avatar: this.avatar,
      admin: this.admin,
      joinedAt: this.joinedAt,
    };
  }

  getPlayerGameId(): string | undefined {
    return this.connection.gameId;
  }

  setPlayerInfo(playerInfo: PlayerInfo): void {
    this.nickname = playerInfo.nickname;
    this.avatar = playerInfo.avatar;
  }

  isAdmin(): boolean {
    return this.admin;
  }

  makeAdmin(): void {
    this.admin = true;
  }

  send(message: GameResponse): void {
    this.connection.send(JSON.stringify(message));
  }
}

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
    return this.players.map((player: Player) => ({
      ...player.getPlayerInfo(),
    }));
  }

  getAdmin(): Player | undefined {
    return this.players.find((player: Player) => player.isAdmin());
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

  setGameInfo(game: GameInfo): void {
    this.maxPlayers = game.maxPlayers;
    this.rounds = game.rounds;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(playerToBeRemoved: Player): void {
    this.players = this.players.filter(
      (player) => player.getPlayerId() !== playerToBeRemoved.getPlayerId()
    );
  }

  broadcast(response: GameResponse): void {
    for (const player of this.players) {
      player.send(response);
    }
  }

  terminate(): void {
    const terminateResponse: TerminateResponse = {
      method: "terminate",
    };

    for (const player of this.players) {
      player.send(terminateResponse);
    }
  }
}

export class PlayerStore {
  private static instance: PlayerStore;
  private constructor() {}

  static getInstace(): PlayerStore {
    if (!PlayerStore.instance) {
      PlayerStore.instance = new PlayerStore();
    }
    return PlayerStore.instance;
  }

  private players = new Map<string, Player>();

  addPlayer(player: Player): void {
    this.players.set(player.getPlayerId(), player);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  removePlayer(player: Player): void {
    this.players.delete(player.getPlayerId());
  }

  removeGamePlayers(game: Game): void {
    for (const player of game.getPlayers()) {
      this.removePlayer(player);
    }
  }
}

export class GameStore {
  private static instance: GameStore;
  private constructor() {}

  static getInstace(): GameStore {
    if (!GameStore.instance) {
      GameStore.instance = new GameStore();
    }
    return GameStore.instance;
  }

  private games = new Map<string, Game>();

  addGame(game: Game): void {
    this.games.set(game.getGameId(), game);
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  getGamePlayedByPlayer(player: Player): Game | undefined {
    const gameId = player.getPlayerGameId();
    if (gameId === undefined) return undefined;
    return this.games.get(gameId);
  }

  removeGame(game: Game): void {
    this.games.delete(game.getGameId());
  }
}
