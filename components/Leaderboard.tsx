import { PlayerInfo } from "../server/types";
import Player from "./Player";

interface LeaderboardProps {
  playersInOrder: PlayerInfo[];
  thisPlayer: PlayerInfo;
}

export default function Leaderboard(props: LeaderboardProps) {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <div className="players">
        {props.playersInOrder.map((player) =>
          player ? (
            <Player
              player={player}
              thisPlayer={player.id === props.thisPlayer.id}
              showScore
            />
          ) : (
            player
          )
        )}
      </div>
    </div>
  );
}
