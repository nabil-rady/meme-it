import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Dropdown from "../components/Dropdown";
import Invite from "../components/Invite";
import Player from "../components/Player";

import handleResponse from "../lib/handleResponse";

import {
  GameInfo,
  GameResponse,
  JoinRequest,
  PlayerInfo,
} from "../server/types";

export default function Home() {
  const router = useRouter();

  const ws = useRef<WebSocket>();

  const [game, setGame] = useState<GameInfo>();
  const [thisPlayer, setThisPlayer] = useState<PlayerInfo>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  useEffect(() => {
    if (!router.query.slug) return;
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e: MessageEvent<string>) => {
      try {
        const response = JSON.parse(e.data) as GameResponse;
        handleResponse(response, setGame, setThisPlayer, setPlayers);
      } catch (err) {
        console.error(err);
      }
    });
    ws.current.addEventListener("open", () => {
      const request: JoinRequest = {
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

  const renderGameUI = (
    game: GameInfo | undefined,
    thisPlayer: PlayerInfo | undefined,
    players: PlayerInfo[]
  ) => {
    return (
      <>
        <main className="home lobby">
          <h1>Meme It</h1>
          {game && thisPlayer && players.length !== 0 ? (
            <div className="lobby-container">
              <div className="players-container">
                <h2>Players ({players.length})</h2>
                <div className="players">
                  {players.map((player) => (
                    <Player
                      key={player.id}
                      player={player}
                      thisPlayer={player.id === thisPlayer.id}
                    />
                  ))}
                </div>
              </div>
              <div className="options">
                <div className="game-options">
                  <Dropdown
                    label="Number of rounds"
                    name="number-of-rounds"
                    options={["1", "2", "3"]}
                  />
                  <Dropdown
                    label="Number of players"
                    name="number-of-players"
                    options={["6", "8", "10"]}
                  />
                </div>
                <div className="buttons">
                  <Invite id={game.id} />
                  <button className="button start-button">Start game</button>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </>
    );
  };

  return (
    <div className="app">
      <Head>
        <title>Meme It</title>
      </Head>
      {renderGameUI(game, thisPlayer, players)}
    </div>
  );
}
