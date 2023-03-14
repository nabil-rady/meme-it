import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Player from "../components/Player";
import Invite from "../components/Invite";

import handleResponse from "../lib/handleResponse";

import { GameInfo, JoinRequest, PlayerInfo } from "../server/types";

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
    ws.current.addEventListener("message", (e) => {
      try {
        const response = JSON.parse(e.data);
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
          isAdmin: false,
          nickname: "guest",
          avatar: "/avatar/bugs.jpg",
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
        {game && thisPlayer && players.length !== 0 ? (
          <>
            <div className="players">
              {players.map((player: PlayerInfo) => (
                <Player key={player.id} player={player} />
              ))}
            </div>
            <Invite id={game.id} />
          </>
        ) : null}
      </>
    );
  };

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
