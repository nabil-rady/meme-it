import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { AiFillLike, AiFillDislike } from "react-icons/ai";

import { useMediaQuery } from "@react-hook/media-query";

import { Meme } from "../lib/Meme";

import {
  MemeForReview,
  PlayerInfo,
  SubmitReviewRequestBody,
} from "../server/types";

interface MemeForReviewProps {
  secondsLeft: number;
  memeForReview: MemeForReview;
  thisPlayer: PlayerInfo;
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

  const mediaQuery = useMediaQuery("(max-width: 700px)");

  const creator = props.memeForReview.creatorPlayerId === props.thisPlayer.id;

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

  useEffect(() => {
    if (meme.current) {
      if (!mediaQuery) {
        meme.current.canvas.width = 500;
        meme.current.canvas.height = 500;
      } else {
        meme.current.canvas.width = 0.7 * document.body.clientWidth;
        meme.current.canvas.height = 0.7 * document.body.clientWidth;
      }
      meme.current.render();
    }
  }, [mediaQuery, meme.current]);

  return (
    <>
      <div className="meme-timer">{props.secondsLeft} Seconds Left</div>
      <div className="meme-container">
        <div className="meme">
          <canvas id="meme-canvas" width="500" height="500"></canvas>
        </div>
        <div className="buttons">
          <AiFillLike
            className={`vote-button like ${creator ? "disabled" : ""}`}
            size={40}
            fill={props.upvoted === true ? "#133ea9" : "currentColor"}
            onClick={() => {
              props.setUpvoted(true);
              submitReview(props.memeForReview.creatorPlayerId, props.ws, true);
            }}
          />
          <AiFillDislike
            className={`vote-button dislike ${creator ? "disabled" : ""}`}
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
