import type { connection as Connection } from "websocket";
import { Player, Game } from "./lib";

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
  isAdmin: boolean;
  nickname: string;
  avatar: string;
}

export interface GameInfo {
  id: string;
  rounds: number;
  maxPlayers: number;
}

export interface CreateRequest {
  method: "create";
  admin: Omit<PlayerInfo, "id">;
  game: Omit<GameInfo, "id">;
}

export interface JoinRequest {
  method: "join";
  player: Omit<PlayerInfo, "id">;
  gameId: string;
}

export interface UpdatePlayerRequest {
  method: "updatePlayer";
  updatedPlayer: PlayerInfo;
}

export interface UpdateGameRequest {
  method: "updateGame";
  updatedGame: GameInfo;
}

export type GameRequest =
  | CreateRequest
  | JoinRequest
  | UpdatePlayerRequest
  | UpdateGameRequest;

export interface CreateResponse {
  method: "create";
  game: GameInfo;
  admin: PlayerInfo;
}

export interface JoinResponse {
  method: "join";
  game: GameInfo;
  players: PlayerInfo[];
}

export interface UpdatePlayerResponse {
  method: "updatePlayer";
  updatedPlayer: PlayerInfo;
}

export interface UpdateGameResponse {
  method: "updateGame";
  updatedGame: GameInfo;
}

export interface LeaveResponse {
  method: "leave";
  player: PlayerInfo;
}

export interface TerminateResponse {
  method: "terminate";
}

export interface ErrorResponse {
  error: string;
}

export type GameResponse =
  | CreateResponse
  | JoinResponse
  | UpdatePlayerResponse
  | UpdateGameResponse
  | LeaveResponse
  | TerminateResponse;
