import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import MemeForReviewComponent from "./MemeForReview";

import { MemeForReview, PlayerInfo } from "../server/types";

interface ReviewPhaseProps {
  meme: MemeForReview;
  thisPlayer: PlayerInfo;
  upvoted: boolean | null;
  setUpvoted: Dispatch<SetStateAction<boolean | null>>;
  ws: MutableRefObject<WebSocket | undefined>;
}

export default function ReviewPhase(props: ReviewPhaseProps) {
  const intervalId = useRef<NodeJS.Timer>();

  const [secondsLeft, setSecondsLeft] = useState<number>(15);

  useEffect(() => {
    if (secondsLeft === 0) {
      clearInterval(intervalId.current);
    }
  }, [secondsLeft]);

  useEffect(() => {
    if (props.meme) {
      if (secondsLeft == 0) {
        setSecondsLeft(15);
        intervalId.current = setInterval(() => {
          setSecondsLeft((prevSeconds) =>
            prevSeconds === 0 ? prevSeconds : prevSeconds - 1
          );
        }, 1000);
      }
    }
  }, [props.meme]);

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setSecondsLeft((prevSeconds) =>
        prevSeconds === 0 ? prevSeconds : prevSeconds - 1
      );
    }, 1000);

    return () => clearInterval(intervalId.current);
  }, []);

  return (
    <MemeForReviewComponent
      secondsLeft={secondsLeft}
      memeForReview={props.meme}
      thisPlayer={props.thisPlayer}
      upvoted={props.upvoted}
      setUpvoted={props.setUpvoted}
      ws={props.ws}
    />
  );
}
