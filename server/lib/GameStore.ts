import { Game } from "./Game";
import { Player } from "./Player";

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

  addGame(game: Game) {
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

  removeGame(game: Game) {
    this.games.delete(game.getGameId());
  }
}
