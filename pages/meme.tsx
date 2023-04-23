import { useEffect, useRef, useState } from "react";
import { Meme } from "../lib/Meme";
import { DMemeWithCaptionDetails } from "../dbtypes";

export default function MemePage() {
  const meme = useRef<Meme>();

  const [captions, setCaptions] = useState<string[]>([]);

  useEffect(() => {
    if (!meme.current) return;
    meme.current.captions = captions;
    meme.current.render();
  }, [captions]);

  useEffect(() => {
    fetch("/api/get-random-meme")
      .then((res) => res.json())
      .then((data: DMemeWithCaptionDetails) => {
        meme.current = new Meme("meme-canvas", {
          url: data.url,
          captionsDetails: data.captionsDetails,
        });
        setCaptions(new Array(data.captionsDetails.length).fill(""));
      });
  }, []);

  return (
    <div>
      <canvas id="meme-canvas" width="500" height="500"></canvas>
      <br />
      {captions.map((caption, index) => (
        <>
          <input
            type="text"
            value={caption}
            onChange={(e) =>
              setCaptions((prevCaptions) => {
                const newCaptions = [...prevCaptions];
                newCaptions[index] = e.target.value;
                return newCaptions;
              })
            }
          />
          <br />
        </>
      ))}
    </div>
  );
}
