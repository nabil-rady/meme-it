import { useEffect, useRef } from "react";
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { Meme } from "../lib/Meme";

import { MemeResult, PlayerInfo } from "../server/types";

interface MemeResultProps {
  player: PlayerInfo | undefined;
  memeResult: MemeResult;
  index: number;
}

const downloadMeme = (player: PlayerInfo | undefined, meme: Meme) => {
  const filename = `memeit-${Date.now().valueOf()}-${
    player ? player.nickname : ""
  }.png`;
  meme.download(filename);
};

export default function MemeResultComponent(props: MemeResultProps) {
  const CANVAS_ID = `meme-canvas-${[props.index]}`;

  const meme = useRef<Meme>();

  useEffect(() => {
    meme.current = new Meme(CANVAS_ID, {
      url: props.memeResult.meme.url,
      captionsDetails: props.memeResult.meme.captionsDetails,
    });
    meme.current.captions =
      props.memeResult.captions ??
      new Array(props.memeResult.meme.captionsDetails.length).fill("");
    meme.current.render();
  }, [props.memeResult.meme]);

  useEffect(() => {
    if (!meme.current) return;
    meme.current.captions =
      props.memeResult.captions ??
      new Array(props.memeResult.meme.captionsDetails.length).fill("");
    meme.current.render();
  }, [props.memeResult.captions]);

  return (
    <>
      <div className="meme">
        <canvas id={CANVAS_ID} width="500" height="500"></canvas>
        <div className="player-image">
          <img
            alt={`${props.player?.nickname} avatar`}
            src={props.player?.avatar}
            draggable={false}
          />
        </div>
      </div>
      <div className="buttons">
        <button
          className="button"
          onClick={() => {
            if (meme.current) downloadMeme(props.player, meme.current);
          }}
        >
          Download
        </button>
        <div className="review-buttons">
          <div className="review-number">
            <AiFillLike size={40} />
            <span>{props.memeResult.upvotes}</span>
          </div>
          <div className="review-number">
            <AiFillDislike size={40} />
            <span>{props.memeResult.downvotes}</span>
          </div>
        </div>
      </div>
    </>
  );
}
