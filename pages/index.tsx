import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BiRefresh } from "react-icons/bi";

import AvatarSelect from "../components/AvatarSelect";
import { DMemeWithCaptionDetails } from "../dbtypes";

import renderGameUI from "../lib/renderGameUI";
import { createResponseHandler } from "../lib/ResponseHandler";

import {
  GameInfo,
  PlayerInfo,
  GameResponseBody,
  CreateRequestBody,
} from "../server/types";

export default function Home() {
  const ws = useRef<WebSocket>();

  const [game, setGame] = useState<GameInfo>();
  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [meme, setMeme] = useState<DMemeWithCaptionDetails>();
  const [captions, setCaptions] = useState<string[]>([]);

  const [avatar, setAvatar] = useState<string>("/avatars/1.jpg");
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

  const createGame = (nickname: string, avatar: string) => {
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e: MessageEvent<string>) => {
      const response = JSON.parse(e.data) as GameResponseBody;
      const responseHandler = createResponseHandler(
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
      const request: CreateRequestBody = {
        method: "create",
        admin: {
          nickname,
          avatar,
          admin: true,
        },
        game: {
          rounds: 2,
          maxPlayers: 10,
        },
      };
      ws.current?.send(JSON.stringify(request));
    });
  };

  useEffect(() => {
    return () => ws.current?.close();
  }, []);

  const renderHome = () => (
    <main className="home">
      <h1>Meme It</h1>
      <div className="avatar-container">
        <Image
          src={avatar}
          alt="avatar"
          className="avatar"
          width={585}
          height={585}
          onClick={openAvatarSelect}
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

  const render = (
    game: GameInfo | undefined,
    thisPlayer: PlayerInfo | undefined,
    players: PlayerInfo[]
  ) =>
    game && thisPlayer && players.length !== 0
      ? renderGameUI(game, thisPlayer, players, meme, captions, setCaptions, ws)
      : renderHome();

  return (
    <div className="app">
      <Head>
        <title>Meme It</title>
      </Head>
      {render(game, thisPlayer, players)}
    </div>
  );
}
