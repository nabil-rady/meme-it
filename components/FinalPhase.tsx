import { PlayerInfo } from "../server/types";
import Player from "./Player";

interface FinalPhaseProps {
  thisPlayer: PlayerInfo;
  players: PlayerInfo[];
}

const getTopThree = (players: PlayerInfo[]): PlayerInfo[] => {
  return [...players].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
};

export default function FinalPhase(props: FinalPhaseProps) {
  return (
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
  );
}
