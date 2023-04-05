import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { AiFillLike, AiFillDislike } from "react-icons/ai";

import { Meme } from "../lib/Meme";

import { MemeForReview, SubmitReviewRequestBody } from "../server/types";

interface MemeForReviewProps {
  secondsLeft: number;
  memeForReview: MemeForReview;
  upvoted: boolean | null;
  setUpvoted: Dispatch<SetStateAction<boolean | null>>;
  ws: MutableRefObject<WebSocket | undefined>;
}

const CANVAS_ID = "meme-canvas";

const submitReview = (
  creatorPlayerId: string,
  ws: MutableRefObject<WebSocket | undefined>,
  like: boolean
) => {
  const submitReviewRequest: SubmitReviewRequestBody = {
    method: "submitReview",
    playerToBeReviewedId: creatorPlayerId,
    like,
  };
  ws.current?.send(JSON.stringify(submitReviewRequest));
};

export default function MemeForReviewComponent(props: MemeForReviewProps) {
  const meme = useRef<Meme>();

  useEffect(() => {
    meme.current = new Meme(CANVAS_ID, {
      url: props.memeForReview.meme.url,
      captionsDetails: props.memeForReview.meme.captionsDetails,
    });
    meme.current.captions =
      props.memeForReview.captions ??
      new Array(props.memeForReview.meme.captionsDetails.length).fill("");
    meme.current.render();

    props.setUpvoted(null);
  }, [props.memeForReview.meme]);

  useEffect(() => {
    if (!meme.current) return;
    meme.current.captions =
      props.memeForReview.captions ??
      new Array(props.memeForReview.meme.captionsDetails.length).fill("");
    meme.current.render();
  }, [props.memeForReview.captions]);

  return (
    <>
      <div className="meme-timer">{props.secondsLeft} Seconds Left</div>
      <div className="meme-container">
        <div className="meme">
          <canvas id="meme-canvas" width="500" height="500"></canvas>
        </div>
        <div className="buttons">
          <AiFillLike
            size={40}
            fill={props.upvoted === true ? "#133ea9" : "currentColor"}
            onClick={() => {
              props.setUpvoted(true);
              submitReview(props.memeForReview.creatorPlayerId, props.ws, true);
            }}
          />
          <AiFillDislike
            size={40}
            fill={props.upvoted === false ? "#133ea9" : "currentColor"}
            onClick={() => {
              props.setUpvoted(false);
              submitReview(
                props.memeForReview.creatorPlayerId,
                props.ws,
                false
              );
            }}
          />
        </div>
      </div>
    </>
  );
}
