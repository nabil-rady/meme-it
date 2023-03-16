import { Dispatch, SetStateAction } from "react";
import {
  CreateResponse,
  GameResponse,
  JoinResponse,
  UpdatePlayerResponse,
  UpdateGameResponse,
  LeaveResponse,
  PlayerInfo,
  GameInfo,
} from "../server/types";

function handleCreateResponse(
  response: CreateResponse,
  setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
  setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  setGame(response.game);
  setThisPlayer(response.admin);
  setPlayers([response.admin]);
}

function handleJoinResponse(
  response: JoinResponse,
  setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
  setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  setGame(response.game);
  setThisPlayer((thisPlayer) =>
    thisPlayer ? thisPlayer : response.players.at(-1)
  );
  setPlayers(response.players);
}

function handleUpdatePlayerResponse(
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

function handleUpdateGameResponse(
  response: UpdateGameResponse,
  setGame: Dispatch<SetStateAction<GameInfo | undefined>>
) {
  setGame(response.updatedGame);
}

function handleLeaveResponse(
  response: LeaveResponse,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  setPlayers((prevPlayers) =>
    prevPlayers.filter((player) => player.id !== response.player.id)
  );
}

export default function handleResponse(
  response: GameResponse,
  setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
  setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
  setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>
): void {
  if ("error" in response) {
    console.error(response.error);
    window.location.href = "/";
    // TODO: Error handling here
  }
  if (response.method === "create") {
    handleCreateResponse(response, setGame, setThisPlayer, setPlayers);
  } else if (response.method === "join") {
    handleJoinResponse(response, setGame, setThisPlayer, setPlayers);
  } else if (response.method === "updatePlayer") {
    handleUpdatePlayerResponse(response, setPlayers);
  } else if (response.method === "updateGame") {
    handleUpdateGameResponse(response, setGame);
  } else if (response.method === "leave") {
    handleLeaveResponse(response, setPlayers);
  } else if (response.method === "terminate") {
    // TODO: Termination handling here
    window.location.reload();
  }
}
