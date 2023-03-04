import { v4 as uuid } from "uuid";
import {
  GameConnection,
  GameResponse,
  TerminateResponse,
  PlayerInfo,
  GameInfo,
} from "./types";

export class Player {
  readonly id: string;
  nickname: string;
  avatar: string;
  readonly isAdmin: boolean;
  private readonly connection: GameConnection;

  constructor(
    nickname: string,
    avatar: string,
    isAdmin: boolean,
    connection: GameConnection
  ) {
    this.id = uuid();
    this.nickname = nickname;
    this.avatar = avatar;
    this.isAdmin = isAdmin;
    this.connection = connection;
  }

  getPlayerInfo(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      avatar: this.avatar,
      isAdmin: this.isAdmin,
    };
  }

  getPlayerGameId(): string | undefined {
    return this.connection.gameId;
  }

  setPlayerInfo(playerInfo: PlayerInfo): void {
    this.nickname = playerInfo.nickname;
    this.avatar = playerInfo.avatar;
  }

  send(message: GameResponse): void {
    this.connection.send(JSON.stringify(message));
  }
}

export class Game {
  readonly id: string;
  readonly rounds: number;
  readonly maxPlayers: number;
  readonly admin: Player;
  private players: Player[];

  constructor(rounds: number, maxPlayers: number, admin: Player) {
    this.id = uuid();
    this.rounds = rounds;
    this.maxPlayers = maxPlayers;
    this.admin = admin;
    this.players = [admin];
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
      id: player.id,
      nickname: player.nickname,
      avatar: player.avatar,
      isAdmin: player.isAdmin,
    }));
  }

  getPlayers(): Player[] {
    return this.players;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(playerToBeRemoved: Player): void {
    this.players = this.players.filter(
      (player) => player.id !== playerToBeRemoved.id
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
    this.players.set(player.id, player);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  removePlayer(player: Player): void {
    this.players.delete(player.id);
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
    this.games.set(game.id, game);
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
    this.games.delete(game.id);
  }
}
