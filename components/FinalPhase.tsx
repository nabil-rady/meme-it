import { MutableRefObject } from "react";

import Player from "./Player";

import { PlayerInfo, RestartGameRequestBody } from "../server/types";

interface FinalPhaseProps {
  thisPlayer: PlayerInfo;
  players: PlayerInfo[];
  ws: MutableRefObject<WebSocket | undefined>;
}

const getTopThree = (players: PlayerInfo[]): PlayerInfo[] => {
  return [...players].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
};

const sendRestartGameRequest = (
  ws: MutableRefObject<WebSocket | undefined>
) => {
  const restartGameRequest: RestartGameRequestBody = {
    method: "restart",
  };
  ws.current?.send(JSON.stringify(restartGameRequest));
};

export default function FinalPhase(props: FinalPhaseProps) {
  return (
    <>
      <div className="top-3">
        <div className="players">
          {getTopThree(props.players).map((player, index) => (
            <div>
              <p>{index + 1})</p>
              <Player
                player={player}
                thisPlayer={props.thisPlayer.id === player.id}
              />
            </div>
          ))}
        </div>
      </div>
      {props.thisPlayer.admin && (
        <div className="buttons">
          <button
            className="button"
            onClick={() => {
              sendRestartGameRequest(props.ws);
            }}
          >
            Back to lobby
          </button>
          <button className="button">Terminate game</button>
        </div>
      )}
    </>
  );
}
