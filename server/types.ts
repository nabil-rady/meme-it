import type { connection as Connection } from "websocket";
import { Game } from "./lib/Game";
import { Player } from "./lib/Player";
import { DMemeWithCaptionDetails } from "../dbtypes";

export type GamePhase = "lobby" | "caption" | "review" | "result" | "final";

export type MemeForReview = {
  meme: DMemeWithCaptionDetails;
  captions: string[] | null;
  creatorPlayerId: string;
};

export type MemeResult = MemeForReview & {
  upvotes: number;
  downvotes: number;
};

export type Votes = {
  [key: string]: boolean;
};

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
  inGame: boolean;
  joinedAt: number;
  totalScore: number;
}

export interface GameInfo {
  id: string;
  rounds: number;
  maxPlayers: number;
  phase: GamePhase;
  currentRound: number;
}

export interface CreateRequestBody {
  method: "create";
  admin: Omit<
    PlayerInfo,
    "id" | "admin" | "inGame" | "joinedAt" | "totalScore"
  >;
  game: Omit<GameInfo, "id" | "phase" | "currentRound">;
}

export interface JoinRequestBody {
  method: "join";
  gameId: string;
  avatar: string;
  nickname: string;
}

export interface UpdatePlayerRequestBody {
  method: "updatePlayer";
  updatedPlayer: Omit<
    PlayerInfo,
    "id" | "admin" | "inGame" | "joinedAt" | "totalScore"
  >;
}

export interface UpdateGameRequestBody {
  method: "updateGame";
  updatedGame: Omit<GameInfo, "id" | "phase" | "currentRound">;
}

export interface StartGameRequestBody {
  method: "startGame";
}

export interface SubmitCaptionsRequestBody {
  method: "submitCaption";
  captions: string[];
}

export interface SubmitReviewRequestBody {
  method: "submitReview";
  like: boolean;
  playerToBeReviewedId: string;
}

export interface SendMessageRequestBody {
  method: "sendMessage";
  sender: PlayerInfo;
  content: string;
}

export interface RestartGameRequestBody {
  method: "restart";
}

export interface TerminateGameRequestBody {
  method: "terminate";
}

export type GameRequestBody =
  | CreateRequestBody
  | JoinRequestBody
  | UpdatePlayerRequestBody
  | UpdateGameRequestBody
  | StartGameRequestBody
  | SubmitCaptionsRequestBody
  | SubmitReviewRequestBody
  | SendMessageRequestBody
  | RestartGameRequestBody
  | TerminateGameRequestBody;

export interface CreateResponseBody {
  method: "create";
  game: GameInfo;
  admin: PlayerInfo;
}

export interface JoinResponseBody {
  method: "join";
  game: GameInfo;
  players: PlayerInfo[];
  message: ChatMessage;
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

export interface SubmitCaptionsResponseBody {
  method: "submitCaption";
  success: boolean;
}

export interface EndCaptionPhaseResponseBody {
  method: "endCaptionPhase";
}

export interface MemeForReviewResponseBody {
  method: "memeForReview";
  meme: MemeForReview;
}

export interface SubmitReviewResponseBody {
  method: "submitReview";
  success: boolean;
}

export interface EndReviewPhaseResponseBody {
  method: "endReviewPhase";
  results: MemeResult[];
}

export type EndResultPhaseResponseBody =
  | {
      method: "endResultPhase";
      end: true;
    }
  | {
      method: "endResultPhase";
      end: false;
      meme: DMemeWithCaptionDetails;
    };

export interface SendMessageResponseBody {
  method: "sendMessage";
  message: ChatMessage;
}

export interface RestartGameResponseBody {
  method: "restart";
  players: PlayerInfo[];
}

export interface LeaveResponseBody {
  method: "leave";
  player: PlayerInfo;
  restOfPlayers: PlayerInfo[];
  newAdmin: PlayerInfo | null;
  messages: ChatMessage[];
}

export interface TerminateResponseBody {
  method: "terminate";
}

export interface ErrorResponseBody {
  code: number;
  error: string;
}

export type GameResponseBody =
  | CreateResponseBody
  | JoinResponseBody
  | UpdatePlayerResponseBody
  | UpdateGameResponseBody
  | StartGameResponseBody
  | SubmitCaptionsResponseBody
  | EndCaptionPhaseResponseBody
  | MemeForReviewResponseBody
  | SubmitReviewResponseBody
  | EndReviewPhaseResponseBody
  | EndResultPhaseResponseBody
  | SendMessageResponseBody
  | RestartGameResponseBody
  | LeaveResponseBody
  | TerminateResponseBody;

export interface ChatMessage {
  timestamp: number;
  isSystemMessage: boolean;
  content: string;
  sentBy: PlayerInfo | null;
  read?: boolean;
}
