import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { BiRefresh } from "react-icons/bi";

import AvatarSelect from "../components/AvatarSelect";
import Chat from "../components/Chat";
import { DMemeWithCaptionDetails } from "../dbtypes";

import renderGameUI from "../lib/renderGameUI";
import { ResponseHandler } from "../lib/ResponseHandler";

import {
  MemeForReview,
  MemeResult,
  GameInfo,
  PlayerInfo,
  GameResponseBody,
  CreateRequestBody,
  ErrorResponseBody,
  ChatMessage,
  SendMessageRequestBody,
} from "../server/types";

export default function Home() {
  const ws = useRef<WebSocket>();

  const [game, setGame] = useState<GameInfo>();
  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [meme, setMeme] = useState<DMemeWithCaptionDetails>();
  const [memeForReview, setMemeForReview] = useState<MemeForReview>();
  const [captions, setCaptions] = useState<string[]>([]);
  const [memesResults, setMemesResults] = useState<MemeResult[]>([]);
  const [upvoted, setUpvoted] = useState<boolean | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [isNotificationError, setIsNotificationError] =
    useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([
    {
      isSystemMessage: true,
      content: "Welcome to chat.",
      sentBy: null,
      timestamp: 0,
      read: true,
    },
  ]);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const [avatar, setAvatar] = useState<string>("/avatars/0.jpg");
  const [nickname, setNickname] = useState<string>("");
  const [showAvatarSelect, setShowAvatarSelect] = useState<boolean>(false);
  const [nicknameError, setNicknameError] = useState<boolean>(false);

  const nicknameNotEmpty = /^(?!\s*$).+/.test(nickname);

  const openAvatarSelect = () => {
    setShowAvatarSelect(true);
  };

  const closeAvatarSelect = () => {
    setShowAvatarSelect(false);
  };

  const changeAvatar = (src: string) => {
    setAvatar(src);
  };

  const showNicknameError = () => {
    setNicknameError(true);
  };

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
      const sendMessageRequest: SendMessageRequestBody = {
        method: "sendMessage",
        content: message,
        sender: thisPlayer,
      };
      ws.current?.send(JSON.stringify(sendMessageRequest));
    }
  };

  const createGame = (nickname: string, avatar: string) => {
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
        setIsNotificationError,
        setChatLogs
      );

      responseHandler.handle();
    });
    ws.current.addEventListener("open", () => {
      const request: CreateRequestBody = {
        method: "create",
        admin: {
          nickname,
          avatar,
        },
        game: {
          rounds: 1,
          maxPlayers: 6,
        },
      };
      ws.current?.send(JSON.stringify(request));
      setRequestSent(true);
    });
  };

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
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get("terminate"));
    if (urlParams.get("terminated") === "true")
      toast("Game has been terminated by admin", {
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
    return () => ws.current?.close();
  }, []);

  const renderHome = () => (
    <main className="home">
      <h1 className="title">Meme It</h1>
      <div className="avatar-container">
        <Image
          src={avatar}
          alt="avatar"
          className="avatar"
          width={585}
          height={585}
          onClick={openAvatarSelect}
          draggable={false}
          priority
        />
        <button className="change-avatar" onClick={openAvatarSelect}>
          <BiRefresh className="icon" />
        </button>
      </div>

      <div className="nickname-container">
        {nicknameError && (
          <span className="error-message">Please Enter A Nickname</span>
        )}
        <input
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setNicknameError(false);
          }}
          className={`nickname-input ${nicknameError ? "error" : ""}`}
          placeholder="Nickname"
          maxLength={15}
        />
      </div>

      {showAvatarSelect && (
        <AvatarSelect
          avatar={avatar}
          closeAvatarSelect={closeAvatarSelect}
          changeAvatar={changeAvatar}
        />
      )}

      <div className="buttons">
        <button className="button">Join Lobby</button>
        <button
          className="button"
          onClick={
            nicknameNotEmpty
              ? () => createGame(nickname, avatar)
              : showNicknameError
          }
        >
          Create New Lobby
        </button>
      </div>
    </main>
  );

  const render = () =>
    requestSent ? (
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
    ) : (
      renderHome()
    );

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
