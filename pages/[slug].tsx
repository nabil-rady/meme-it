import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import Chat from "../components/Chat";
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
  ErrorResponseBody,
  ChatMessage,
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

  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([
    {
      timestamp: 0,
      isSystemMessage: false,
      content:
        "Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks Hey folks ",
      sentBy: {
        id: "1",
        admin: false,
        avatar: "/avatars/1.jpg",
        inGame: true,
        joinedAt: 0,
        nickname: "7mada",
        totalScore: 10,
      },
    },
    {
      timestamp: 0,
      isSystemMessage: true,
      content: "7amada left the game",
      sentBy: null,
    },
    {
      timestamp: 0,
      isSystemMessage: false,
      content: "Hey folks",
      sentBy: {
        id: "1",
        admin: false,
        avatar: "/avatars/1.jpg",
        inGame: true,
        joinedAt: 0,
        nickname: "7mada",
        totalScore: 10,
      },
    },
    {
      timestamp: 0,
      isSystemMessage: false,
      content: "Hey folks",
      sentBy: {
        id: "1",
        admin: false,
        avatar: "/avatars/1.jpg",
        inGame: true,
        joinedAt: 0,
        nickname: "7mada",
        totalScore: 10,
      },
    },
    {
      timestamp: 0,
      isSystemMessage: false,
      content: "Hey folks",
      sentBy: {
        id: "1",
        admin: false,
        avatar: "/avatars/1.jpg",
        inGame: true,
        joinedAt: 0,
        nickname: "7mada",
        totalScore: 10,
      },
    },
  ]);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

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

  const sendMessage = (message: string) => {
    if (!thisPlayer) return;
    if (message !== "") {
      setChatLogs((prevLogs) => [
        ...prevLogs,
        {
          timestamp: Date.now(),
          content: message,
          isSystemMessage: false,
          read: true,
          sentBy: thisPlayer,
        },
      ]);
    }
  };

  useEffect(() => {
    if (!notificationMessage) {
      return;
    }
    if (isNotificationError && !game) {
      setTimeout(() => {
        window.location.href = "/";
      }, 1000 * 1.5);
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
  }, [chatLogs]);

  useEffect(() => {
    if (!router.query.slug) return;
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
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
        setIsNotificationError
      );

      responseHandler.handle();
    });
    ws.current.addEventListener("open", () => {
      const request: JoinRequestBody = {
        method: "join",
        gameId: router.query.slug as string,
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
      {thisPlayer && (
        <Chat
          chatLogs={chatLogs}
          chatOpen={chatOpen}
          openChat={openChat}
          closeChat={closeChat}
          sendMessage={sendMessage}
        />
      )}
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
      <ToastContainer className="pop-up-container" pauseOnFocusLoss={false} />
    </div>
  );
}
