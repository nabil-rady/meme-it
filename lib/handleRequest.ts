import { Dispatch, SetStateAction } from "react";
import {
  CreateResponse,
  GameResponse,
  JoinResponse,
  LeaveResponse,
  PlayerInfo,
} from "../server/types";

function handleCreateResponse(
  response: CreateResponse,
  creatorNickname: string,
  creatorAvatar: string,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  window.history.pushState({}, "", `/game/${response.gameId}`);
  setPlayers([
    {
      id: response.adminId,
      nickname: creatorNickname,
      avatar: creatorAvatar,
      isAdmin: true,
    },
  ]);
}

function handleJoinResponse(
  response: JoinResponse,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  setPlayers(response.players);
}

function handleLeaveReponse(
  response: LeaveResponse,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  setPlayers((prevPlayers) =>
    prevPlayers.filter((player) => player.id !== response.player.id)
  );
}

export default function handleResponse(
  response: GameResponse,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
  creatorNickname?: string,
  creatorAvatar?: string
) {
  if ("error" in response) {
    window.location.href = "/game";
  }
  if (creatorNickname && creatorAvatar && response.method === "create") {
    handleCreateResponse(response, creatorNickname, creatorAvatar, setPlayers);
  } else if (response.method === "join") {
    handleJoinResponse(response, setPlayers);
  } else if (response.method === "leave") {
    handleLeaveReponse(response, setPlayers);
  } else if (response.method === "terminate") {
    window.location.href = "/game";
  }
}
