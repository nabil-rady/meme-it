import type { connection as Connection } from "websocket";
import { Game } from "./lib/Game";
import { Player } from "./lib/Player";
import { DMemeWithCaptionDetails } from "../dbtypes";

export type GamePhase = "lobby" | "caption" | "review" | "final";

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
  phase: GamePhase;
}

export interface CreateRequestBody {
  method: "create";
  admin: Omit<PlayerInfo, "id" | "joinedAt">;
  game: Omit<GameInfo, "id" | "phase">;
}

export interface JoinRequestBody {
  method: "join";
  player: Omit<PlayerInfo, "id" | "joinedAt">;
  gameId: string;
}

export interface UpdatePlayerRequestBody {
  method: "updatePlayer";
  updatedPlayer: Omit<PlayerInfo, "id" | "admin" | "joinedAt">;
}

export interface UpdateGameRequestBody {
  method: "updateGame";
  updatedGame: Omit<GameInfo, "id" | "phase">;
}

export interface StartGameRequestBody {
  method: "startGame";
}

export interface CaptionRequestBody {
  method: "caption";
  captions: string[];
}

export type GameRequestBody =
  | CreateRequestBody
  | JoinRequestBody
  | UpdatePlayerRequestBody
  | UpdateGameRequestBody
  | StartGameRequestBody
  | CaptionRequestBody;

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

export interface StartGameResponseBody {
  method: "startGame";
  meme: DMemeWithCaptionDetails;
}

export interface CaptionResponseBody {
  method: "caption";
  success: boolean;
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
  | StartGameResponseBody
  | CaptionResponseBody
  | LeaveResponseBody
  | TerminateResponseBody;
