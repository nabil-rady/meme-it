import { Dispatch, SetStateAction, useEffect } from "react";
import { DMemeWithCaptionDetails } from "../dbtypes";
import { Meme } from "../lib/Meme";

interface MemeProps {
  meme: DMemeWithCaptionDetails;
  captions: string[];
  setCaptions: Dispatch<SetStateAction<string[]>>;
}

const CANVAS_ID = "meme-canvas";

export default function MemeComponent(props: MemeProps) {
  useEffect(() => {
    const meme = new Meme(CANVAS_ID, {
      url: props.meme.url,
      captionsDetails: props.meme.captionsDetails,
    });
    meme.captions = props.captions;
    meme.render();
  }, [props.captions]);

  return (
    <div className="meme">
      <canvas id="meme-canvas" width="500" height="500"></canvas>
      <div className="meme-captions">
        {props.captions.map((caption, index) => (
          <input
            key={index}
            value={caption}
            onChange={(e) => {
              props.setCaptions((prevCaptions) => {
                const newCaptions = [...prevCaptions];
                newCaptions[index] = e.target.value;
                return newCaptions;
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
