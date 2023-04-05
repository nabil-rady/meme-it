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
  memes: MemeForReview[];
  upvoted: boolean | null;
  setUpvoted: Dispatch<SetStateAction<boolean | null>>;
  ws: MutableRefObject<WebSocket | undefined>;
}

export default function ReviewPhase(props: ReviewPhaseProps) {
  const numberOfMemesToReview = props.memes.length;

  const intervalId = useRef<NodeJS.Timer>();

  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (secondsLeft === 0) {
      clearInterval(intervalId.current);
      setIndex((index) =>
        index + 1 > numberOfMemesToReview ? index : index + 1
      );
      setSecondsLeft(15);
    }
  }, [secondsLeft]);

  useEffect(() => {
    if (index < numberOfMemesToReview) {
      intervalId.current = setInterval(() => {
        setSecondsLeft((prevSeconds) =>
          prevSeconds === 0 ? prevSeconds : prevSeconds - 1
        );
      }, 1000);

      return () => clearInterval(intervalId.current);
    }
  }, [index]);

  return (
    <MemeForReviewComponent
      secondsLeft={secondsLeft}
      upvoted={props.upvoted}
      setUpvoted={props.setUpvoted}
      memeForReview={props.memes[Math.min(index, numberOfMemesToReview - 1)]}
      ws={props.ws}
    />
  );
}
