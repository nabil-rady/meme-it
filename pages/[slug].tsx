import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import Chat from "../components/Chat";
import PlayerUpdate from "../components/PlayerUpdate";
import renderGameUI from "../lib/renderGameUI";
import { ResponseHandler } from "../lib/ResponseHandler";

import { DMemeWithCaptionDetails } from "../dbtypes";
import {
  MemeForReview,
  MemeResult,
  GameInfo,
  PlayerInfo,
  GameResponseBody,
  ErrorResponseBody,
  ChatMessage,
  SendMessageRequestBody,
} from "../server/types";

export default function Home() {
  const router = useRouter();

  const ws = useRef<WebSocket>();

  const [game, setGame] = useState<GameInfo>();
  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [meme, setMeme] = useState<DMemeWithCaptionDetails>();
  const [memeForReview, setMemeForReview] = useState<MemeForReview>();
  const [upvoted, setUpvoted] = useState<boolean | null>(null);
  const [memesResults, setMemesResults] = useState<MemeResult[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [isNotificationError, setIsNotificationError] =
    useState<boolean>(false);
  const [submittedInfo, setSubmittedInfo] = useState<boolean>(false);

  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([
    {
      isSystemMessage: true,
      content: "Welcome to chat.",
      sentBy: null,
      timestamp: 0,
      read: true,
    },
  ]);
  const [chatOpen, setChatOpen] = useState<boolean>(true);

  const openChat = () => {
    setChatOpen(true);
    setChatLogs((prevLogs) =>
      prevLogs.map((message) => ({
        ...message,
        read: true,
      }))
    );
  };

  const closeChat = () => {
    setChatOpen(false);
  };

  const submitInfo = () => {
    setSubmittedInfo(true);
  };

  const sendMessage = (message: string) => {
    if (!thisPlayer) return;
    if (message !== "") {
      const sendMessageRequest: SendMessageRequestBody = {
        method: "sendMessage",
        content: message,
        sender: thisPlayer,
      };
      ws.current?.send(JSON.stringify(sendMessageRequest));
    }
  };

  useEffect(() => {
    if (!notificationMessage) {
      return;
    }

    if (notificationMessage === "Game not found") {
      setTimeout(() => {
        window.location.href = "/";
      }, 1000 * 1.5);
    }

    if (isNotificationError && submittedInfo) {
      setSubmittedInfo(false);
    }

    toast.dismiss();
    if (isNotificationError)
      toast.error(notificationMessage, {
        position: "bottom-center",
        toastId: "pop-up",
        theme: "dark",
        className: "toast",
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
        className: "toast",
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
    const chat = document.querySelector(".chat-messages");
    if (chat) {
      chat.scroll({
        top: chat.scrollHeight,
      });
    }
    if (chatOpen && chatLogs.at(-1)?.read !== true) {
      setChatLogs((prevLogs) =>
        prevLogs.map((message) => ({
          ...message,
          read: true,
        }))
      );
    }
  }, [chatLogs]);

  useEffect(() => {
    if (!router.query.slug) return;
    const hostname = window.location.hostname;
    const secure = window.location.protocol === "https:";
    const protocol = secure ? "wss" : "ws";
    ws.current = new WebSocket(`${protocol}://${hostname}:9090`);
    ws.current.addEventListener("message", (e: MessageEvent<string>) => {
      const response = JSON.parse(e.data) as
        | GameResponseBody
        | ErrorResponseBody;
      if ("error" in response) {
        setNotificationMessage(response.error);
        setIsNotificationError(true);
        return;
      }
      const responseHandler = ResponseHandler.createResponseHandler(
        response,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );

      responseHandler.handle();
    });

    return () => ws.current?.close();
  }, [router.query.slug]);

  const render = () => {
    if (!submittedInfo)
      return (
        <PlayerUpdate
          joined={false}
          avatar="/avatars/0.jpg"
          nickname={`guest-${Math.floor(Math.random() * 1000) + 1}`}
          closePlayerUpdate={() => {}}
          avatarsTaken={[]}
          submitInfo={submitInfo}
          ws={ws}
        />
      );
    if (thisPlayer)
      return (
        <>
          <Chat
            chatLogs={chatLogs}
            chatOpen={chatOpen}
            openChat={openChat}
            closeChat={closeChat}
            sendMessage={sendMessage}
          />
          {renderGameUI(
            game,
            thisPlayer,
            players,
            meme,
            memeForReview,
            upvoted,
            memesResults,
            captions,
            setCaptions,
            setUpvoted,
            ws
          )}
        </>
      );
    return renderGameUI(
      game,
      thisPlayer,
      players,
      meme,
      memeForReview,
      upvoted,
      memesResults,
      captions,
      setCaptions,
      setUpvoted,
      ws
    );
  };

  return (
    <div className="app">
      <Head>
        <title>Meme It</title>
      </Head>
      {render()}
      <ToastContainer className="pop-up-container" pauseOnFocusLoss={false} />
    </div>
  );
}
