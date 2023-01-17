import { useEffect, useState } from "react";
import Meme from "../lib/Meme";

export default function Home() {
  const [captions, setCaptions] = useState<string[]>(["", ""]);

  useEffect(() => {
    const meme: Meme = new Meme(
      "canvas",
      "/sponge.jpg",
      [
        [500 / 2, 50],
        [310, 260],
      ],
      [0, 18],
      [500, 200]
    );
    meme.captions = captions;
    meme.render();
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
