import { Game } from "./Game";
import { Player } from "./Player";

export class PlayerStore {
  private static instance: PlayerStore;
  private constructor() {}

  static getInstance(): PlayerStore {
    if (!PlayerStore.instance) {
      PlayerStore.instance = new PlayerStore();
    }
    return PlayerStore.instance;
  }

  private players = new Map<string, Player>();

  addPlayer(player: Player) {
    this.players.set(player.getPlayerId(), player);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  removePlayer(player: Player) {
    this.players.delete(player.getPlayerId());
  }

  removeGamePlayers(game: Game) {
    for (const player of game.getPlayers()) {
      this.removePlayer(player);
    }
  }

  removeInactivePlayers(game: Game) {
    for (const player of game.getPlayers()) {
      if (!player.getPlayerInfo().inGame) {
        this.removePlayer(player);
      }
    }
  }
}
