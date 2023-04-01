import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import renderGameUI from "../lib/renderGameUI";
import { ResponseHandler } from "../lib/ResponseHandler";

import { DMemeWithCaptionDetails } from "../dbtypes";
import {
  GameInfo,
  PlayerInfo,
  GameResponseBody,
  JoinRequestBody,
} from "../server/types";

export default function Home() {
  const router = useRouter();

  const ws = useRef<WebSocket>();

  const [game, setGame] = useState<GameInfo>();
  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [meme, setMeme] = useState<DMemeWithCaptionDetails>();
  const [captions, setCaptions] = useState<string[]>([]);

  useEffect(() => {
    if (!router.query.slug) return;
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e: MessageEvent<string>) => {
      const response = JSON.parse(e.data) as GameResponseBody;
      const responseHandler = ResponseHandler.createResponseHandler(
        response,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );

      responseHandler.handle();
    });
    ws.current.addEventListener("open", () => {
      const request: JoinRequestBody = {
        method: "join",
        gameId: router.query.slug as string,
        player: {
          admin: false,
          nickname: "guest",
          avatar: `/avatars/${Math.floor(Math.random() * 11) + 1}.jpg`,
        },
      };
      ws.current?.send(JSON.stringify(request));
    });

    return () => ws.current?.close();
  }, [router.query.slug]);

  return (
    <div className="app">
      <Head>
        <title>Meme It</title>
      </Head>
      {renderGameUI(game, thisPlayer, players, meme, captions, setCaptions, ws)}
    </div>
  );
}
