import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import renderGameUI from "../lib/renderGameUI";
import { ResponseHandler } from "../lib/ResponseHandler";

import { DMemeWithCaptionDetails } from "../dbtypes";
import {
  MemeForReview,
  MemeResult,
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
  const [memesForReview, setMemesForReview] = useState<MemeForReview[]>([]);
  const [memesResults, setMemesResults] = useState<MemeResult[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [isNotificationError, setIsNotificationError] =
    useState<boolean>(false);

  useEffect(() => {
    if (!notificationMessage) {
      return;
    }
    toast.dismiss();
    if (isNotificationError)
      toast.error(notificationMessage, {
        position: "bottom-center",
        toastId: "pop-up",
        theme: "dark",
        hideProgressBar: true,
        closeButton: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        autoClose: 1000,
      });
    else
      toast.success(notificationMessage, {
        position: "bottom-center",
        toastId: "pop-up",
        theme: "dark",
        hideProgressBar: true,
        closeButton: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        autoClose: 1000,
      });
    setNotificationMessage("");
  }, [notificationMessage, isNotificationError]);

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
        setMemesForReview,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError
      );

      responseHandler.handle();
    });
    ws.current.addEventListener("open", () => {
      const request: JoinRequestBody = {
        method: "join",
        gameId: router.query.slug as string,
        player: {
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
      {renderGameUI(
        game,
        thisPlayer,
        players,
        meme,
        memesForReview,
        memesResults,
        captions,
        setCaptions,
        ws
      )}
      <ToastContainer className="pop-up-container" pauseOnFocusLoss={false} />
    </div>
  );
}
