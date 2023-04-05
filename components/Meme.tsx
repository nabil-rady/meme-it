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
  const meme = useRef<Meme>();
  const intervalId = useRef<NodeJS.Timer>();
  const button = useRef<HTMLButtonElement>(null);

  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (!meme.current) {
      meme.current = new Meme(CANVAS_ID, {
        url: props.meme.url,
        captionsDetails: props.meme.captionsDetails,
      });
    }
    meme.current.captions = props.captions;
    meme.current.render();
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
    <>
      <div className="meme-timer">{secondsLeft} Seconds Left</div>
      <div className="meme-container">
        <div className="meme">
          <canvas id="meme-canvas" width="500" height="500"></canvas>
          <div className={`meme-captions ${submitted ? "disabled" : ""}`}>
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
                tabIndex={submitted ? -1 : 0}
              />
            ))}
            <button
              className="button"
              ref={button}
              onClick={
                submitted
                  ? () => {
                      setSubmitted(false);
                      button.current?.blur();
                    }
                  : () => {
                      props.sendCaptions();
                      setSubmitted(true);
                      button.current?.blur();
                    }
              }
            >
              {submitted ? "Edit" : "Submit"}
            </button>
            {submitted && <div className="waiting">Waiting For Players...</div>}
          </div>
        </div>
      </div>
    </>
  );
}
