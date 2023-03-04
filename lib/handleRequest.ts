import { Dispatch, SetStateAction } from "react";
import {
  CreateResponse,
  GameResponse,
  JoinResponse,
  UpdatePlayerResponse,
  LeaveResponse,
  PlayerInfo,
} from "../server/types";

function handleCreateResponse(
  response: CreateResponse,
  creatorNickname: string,
  creatorAvatar: string,
  setCurrentPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  window.history.pushState({}, "", `/game/${response.gameId}`);
  setCurrentPlayer({
    id: response.adminId,
    nickname: creatorNickname,
    avatar: creatorAvatar,
    isAdmin: true,
  });
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
  setCurrentPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  setCurrentPlayer((currentPlayer) =>
    currentPlayer ? currentPlayer : response.players.at(-1)
  );
  setPlayers(response.players);
}

function handleUpdatePlayer(
  response: UpdatePlayerResponse,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
) {
  setPlayers((prevPlayers: PlayerInfo[]) => {
    const newPlayers = [...prevPlayers];
    const playerToUpdateIndex = newPlayers.findIndex(
      (playerInfo: PlayerInfo) => playerInfo.id === response.updatedPlayer.id
    );
    if (playerToUpdateIndex !== -1)
      newPlayers[playerToUpdateIndex] = {
        ...newPlayers[playerToUpdateIndex],
        ...response.updatedPlayer,
      };
    return newPlayers;
  });
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
  setCurrentPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
  creatorNickname?: string,
  creatorAvatar?: string
): void {
  if ("error" in response) {
    console.error(response.error);
    window.location.href = "/game";
  }
  if (creatorNickname && creatorAvatar && response.method === "create") {
    handleCreateResponse(
      response,
      creatorNickname,
      creatorAvatar,
      setCurrentPlayer,
      setPlayers
    );
  } else if (response.method === "join") {
    handleJoinResponse(response, setCurrentPlayer, setPlayers);
  } else if (response.method === "updatePlayer") {
    handleUpdatePlayer(response, setPlayers);
  } else if (response.method === "leave") {
    handleLeaveReponse(response, setPlayers);
  } else if (response.method === "terminate") {
    window.location.href = "/game";
  }
}
