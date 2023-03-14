import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BiRefresh } from "react-icons/bi";

import Avatar from "../public/avatar/bugs.jpg";

import Player from "../components/Player";
import Invite from "../components/Invite";

import handleResponse from "../lib/handleRequest";

import {
  CreateRequest,
  GameInfo,
  GameResponse,
  PlayerInfo,
} from "../server/types";

export default function Home() {
  const ws = useRef<WebSocket>();
  const nicknameInput = useRef<HTMLInputElement>(null);

  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [game, setGame] = useState<GameInfo>();

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
        <Image src={Avatar} alt="avatar" className="avatar" priority />
        <button className="change-avatar">
          <BiRefresh className="icon" />
        </button>
      </div>

      <div className="nickname-container">
        <input
          ref={nicknameInput}
          className="nickname-input"
          placeholder="Nickname"
        />
      </div>

      <div className="buttons">
        <button className="button">Join Lobby</button>
        <button
          className="button"
          onClick={() =>
            createGame(
              nicknameInput.current?.value as string,
              "/avatar/bugs.jpg"
            )
          }
        >
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
