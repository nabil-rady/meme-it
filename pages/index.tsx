import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BiRefresh } from "react-icons/bi";

import Player from "../components/Player";
import Invite from "../components/Invite";
import AvatarSelect from "../components/AvatarSelect";

import handleResponse from "../lib/handleResponse";

import {
  CreateRequest,
  GameInfo,
  GameResponse,
  PlayerInfo,
} from "../server/types";

export default function Home() {
  const ws = useRef<WebSocket>();

  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [avatar, setAvatar] = useState<string>("/avatars/1.jpg");
  const [nickname, setNickname] = useState<string>("");
  const [game, setGame] = useState<GameInfo>();
  const [showAvatarSelect, setShowAvatarSelect] = useState<Boolean>(false);

  const openAvatarSelct = (): void => {
    setShowAvatarSelect(true);
  };

  const closeAvatarSelect = (): void => {
    setShowAvatarSelect(false);
  };

  const changeAvatar = (src: string): void => {
    setAvatar(src);
  };

  const createGame = (nickname: string, avatar: string) => {
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e) => {
      const response = JSON.parse(e.data) as GameResponse;
      handleResponse(response, setGame, setThisPlayer, setPlayers);
    });
    ws.current.addEventListener("open", () => {
      const request: CreateRequest = {
        method: "create",
        admin: {
          nickname,
          avatar,
          isAdmin: true,
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
    <>
      <div className="avatar-container">
        <Image
          src={avatar}
          alt="avatar"
          className="avatar"
          width={585}
          height={585}
          onClick={openAvatarSelct}
          priority
        />
        <button className="change-avatar" onClick={openAvatarSelct}>
          <BiRefresh className="icon" />
        </button>
      </div>

      <div className="nickname-container">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="nickname-input"
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
        <button className="button" onClick={() => createGame(nickname, avatar)}>
          Create New Lobby
        </button>
      </div>
    </>
  );

  const renderGame = (
    game: GameInfo,
    currentPlayer: PlayerInfo,
    players: PlayerInfo[]
  ) => {
    return (
      <>
        <div className="players">
          {players.map((player: PlayerInfo) => (
            <Player key={player.id} player={player} />
          ))}
        </div>
        <Invite id={(game as GameInfo).id} />
      </>
    );
  };

  const renderGameUI = (
    game: GameInfo | undefined,
    thisPlayer: PlayerInfo | undefined,
    players: PlayerInfo[]
  ) =>
    game && thisPlayer && players.length !== 0
      ? renderGame(game, thisPlayer, players)
      : renderHome();

  return (
    <div className="app">
      <Head>
        <title>Meme It</title>
      </Head>
      <main className="home">
        <h1>Meme It</h1>

        {renderGameUI(game, thisPlayer, players)}
      </main>
    </div>
  );
}
