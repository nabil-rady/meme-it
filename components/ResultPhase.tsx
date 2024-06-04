import { useEffect, useRef, useState } from "react";
import { MemeResult, PlayerInfo } from "../server/types";

import Leaderboard from "./Leaderboard";
import MemeResultComponent from "./MemeResult";

interface ResultPhaseProps {
  thisPlayer: PlayerInfo;
  players: PlayerInfo[];
  memesResults: MemeResult[];
}

const sortedPlayers = (players: PlayerInfo[]): PlayerInfo[] => {
  return [...players].sort((a, b) => b.totalScore - a.totalScore);
};

const sortedMemeResults = (memeResults: MemeResult[]): MemeResult[] => {
  return [...memeResults].sort(
    (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
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
      <h2 className="instructions">These are the results of this round</h2>
      <div className="meme-timer">{secondsLeft} Seconds Left</div>
      <div className="meme-container">
        <Leaderboard
          thisPlayer={props.thisPlayer}
          playersInOrder={sortedPlayers(props.players)}
        />
        <div className="memes">
          {sortedMemeResults(props.memesResults).map((memeResult, index) => (
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
