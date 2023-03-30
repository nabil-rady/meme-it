import type { connection as Connection } from "websocket";
import { Game } from "./lib/Game";
import { Player } from "./lib/Player";

export type Phase = "lobby" | "caption" | "review" | "final";

export type GameConnection = Connection & {
  playerId?: string;
  gameId?: string;
};

export interface Players {
  [key: string]: Player;
}

export interface Games {
  [key: string]: Game;
}

export interface PlayerInfo {
  id: string;
  admin: boolean;
  nickname: string;
  avatar: string;
  joinedAt: number;
}

export interface GameInfo {
  id: string;
  rounds: number;
  maxPlayers: number;
}

export interface CreateRequestBody {
  method: "create";
  admin: Omit<PlayerInfo, "id" | "joinedAt">;
  game: Omit<GameInfo, "id">;
}

export interface JoinRequestBody {
  method: "join";
  player: Omit<PlayerInfo, "id" | "joinedAt">;
  gameId: string;
}

export interface UpdatePlayerRequestBody {
  method: "updatePlayer";
  updatedPlayer: PlayerInfo;
}

export interface UpdateGameRequestBody {
  method: "updateGame";
  updatedGame: GameInfo;
}

export type GameRequestBody =
  | CreateRequestBody
  | JoinRequestBody
  | UpdatePlayerRequestBody
  | UpdateGameRequestBody;

export interface CreateResponseBody {
  method: "create";
  game: GameInfo;
  admin: PlayerInfo;
}

export interface JoinResponseBody {
  method: "join";
  game: GameInfo;
  players: PlayerInfo[];
}

export interface UpdatePlayerResponseBody {
  method: "updatePlayer";
  updatedPlayer: PlayerInfo;
}

export interface UpdateGameResponseBody {
  method: "updateGame";
  updatedGame: GameInfo;
}

export interface LeaveResponseBody {
  method: "leave";
  player: PlayerInfo;
  newAdmin: PlayerInfo | null;
}

export interface TerminateResponseBody {
  method: "terminate";
}

export interface ErrorResponseBody {
  error: string;
}

export type GameResponseBody =
  | CreateResponseBody
  | JoinResponseBody
  | UpdatePlayerResponseBody
  | UpdateGameResponseBody
  | LeaveResponseBody
  | TerminateResponseBody;
