import { useEffect, useRef, useState } from "react";
import { MemeResult, PlayerInfo } from "../server/types";

import Leaderboard from "./Leaderboard";
import MemeResultComponent from "./MemeResult";

interface ResultPhaseProps {
  thisPlayer: PlayerInfo;
  players: PlayerInfo[];
  memesResults: MemeResult[];
}

const sortedPlayers = (
  players: PlayerInfo[],
  memesResults: MemeResult[]
): (PlayerInfo | undefined)[] => {
  const sortedPlayerIds = [...memesResults]
    .sort((a, b) => a.upvotes - a.downvotes - b.upvotes + b.upvotes)
    .map((x) => x.creatorPlayerId);

  return sortedPlayerIds.map((playerId) =>
    players.find((player) => player.id === playerId)
  );
};

export default function ResultPhase(props: ResultPhaseProps) {
  const intervalId = useRef<NodeJS.Timer>();
  const [secondsLeft, setSecondsLeft] = useState<number>(40);

  useEffect(() => {
    if (secondsLeft === 0) {
      clearInterval(intervalId.current);
    }
  }, [secondsLeft]);

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setSecondsLeft((secs) => (secs > 0 ? secs - 1 : secs));
    }, 1000);

    return () => clearInterval(intervalId.current);
  }, []);

  return (
    <>
      <div className="meme-timer">{secondsLeft} Seconds Left</div>
      <div className="meme-container">
        <Leaderboard
          thisPlayer={props.thisPlayer}
          playersInOrder={sortedPlayers(props.players, props.memesResults)}
        />
        <div className="memes">
          {props.memesResults.map((memeResult, index) => (
            <MemeResultComponent
              key={index}
              player={props.players.find(
                (player) => player.id === memeResult.creatorPlayerId
              )}
              memeResult={memeResult}
              index={index}
            />
          ))}
        </div>
      </div>
    </>
  );
}
