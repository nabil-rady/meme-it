import { useEffect, useRef, useState } from "react";
import { CaptionDetails, Meme } from "../lib/Meme";

export default function Home() {
  const [captions, setCaptions] = useState<string[]>(["", ""]);

  const meme = useRef<Meme>();

  useEffect(() => {
    const captionDetails = [
      new CaptionDetails(380, 36, 0, 250, 30, 6),
      new CaptionDetails(380, 285, 0, 250, 30, 6),
    ];
    meme.current = new Meme("canvas", "/drake.jpg", captionDetails);
  }, []);

  useEffect(() => {
    if (!meme.current) return;
    meme.current.captions = captions;
    meme.current.render();
  }, [captions]);

  return (
    <main>
      {captions.map((caption, index) => (
        <input
          key={index}
          type="text"
          value={caption}
          style={{
            display: "block",
            margin: "0.8rem 0",
          }}
          onChange={(e) =>
            setCaptions((prevCaptions) => {
              const clone = prevCaptions.slice();
              clone.splice(index, 1, e.target.value);
              return clone;
            })
          }
        />
      ))}
      <canvas id="canvas" width="500" height="500"></canvas>
    </main>
  );
}
