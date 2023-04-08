import { MutableRefObject } from "react";

import Player from "./Player";

import {
  PlayerInfo,
  RestartGameRequestBody,
  TerminateGameRequestBody,
} from "../server/types";

interface FinalPhaseProps {
  thisPlayer: PlayerInfo;
  players: PlayerInfo[];
  ws: MutableRefObject<WebSocket | undefined>;
}

const sendRestartGameRequest = (
  ws: MutableRefObject<WebSocket | undefined>
) => {
  const restartGameRequest: RestartGameRequestBody = {
    method: "restart",
  };
  ws.current?.send(JSON.stringify(restartGameRequest));
};

const sendTerminateGameRequest = (
  ws: MutableRefObject<WebSocket | undefined>
) => {
  const terminateGameRequest: TerminateGameRequestBody = {
    method: "terminate",
  };
  ws.current?.send(JSON.stringify(terminateGameRequest));
};

const rankings = ["first", "second", "third"];

export default function FinalPhase(props: FinalPhaseProps) {
  const orderedPlayers = [...props.players].sort(
    (a, b) => b.totalScore - a.totalScore
  );
  const topThree = orderedPlayers.slice(0, 3);
  const restOfPlayers = orderedPlayers.slice(3);

  return (
    <>
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <div className="players">
          <div className="top-3">
            {topThree.map((player, index) => (
              <div key={player.id} className={`${rankings[index]}`}>
                <Player
                  player={player}
                  thisPlayer={props.thisPlayer.id === player.id}
                />
              </div>
            ))}
          </div>
          {props.players.length > 3 && <span className="bar"></span>}
          <ul className="rest">
            {restOfPlayers.map((player) => (
              <li key={player.id}>
                <Player
                  player={player}
                  thisPlayer={props.thisPlayer.id === player.id}
                />
              </li>
            ))}
          </ul>
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
          <button
            className="button"
            onClick={() => {
              sendTerminateGameRequest(props.ws);
            }}
          >
            Terminate game
          </button>
        </div>
      )}
    </>
  );
}
