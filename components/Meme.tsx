import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { DMemeWithCaptionDetails } from "../dbtypes";
import { Meme } from "../lib/Meme";

interface MemeProps {
  meme: DMemeWithCaptionDetails;
  captions: string[];
  setCaptions: Dispatch<SetStateAction<string[]>>;
  sendCaptions: () => Promise<void>;
}

const CANVAS_ID = "meme-canvas";

export default function MemeComponent(props: MemeProps) {
  const intervalId = useRef<NodeJS.Timer>();

  const [secondsLeft, setSecondsLeft] = useState<number>(60);

  useEffect(() => {
    const meme = new Meme(CANVAS_ID, {
      url: props.meme.url,
      captionsDetails: props.meme.captionsDetails,
    });
    meme.captions = props.captions;
    meme.render();
  }, [props.captions]);

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
    <div className="meme-container">
      <div className="meme-timer">{secondsLeft} Seconds Left</div>
      <div className="meme">
        <canvas id="meme-canvas" width="500" height="500"></canvas>
        <div className="meme-captions">
          {props.captions.map((caption, index) => (
            <input
              key={index}
              value={caption === `Caption ${index + 1}` ? "" : caption}
              placeholder={`Caption ${index + 1}`}
              onChange={(e) => {
                props.setCaptions((prevCaptions) => {
                  const newCaptions = [...prevCaptions];
                  newCaptions[index] = e.target.value;
                  return newCaptions;
                });
              }}
            />
          ))}
          <button className="button" onClick={() => props.sendCaptions()}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
