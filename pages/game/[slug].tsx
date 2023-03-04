import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  GameResponse,
  ErrorResponse,
  JoinRequest,
  PlayerInfo,
} from "../../server/types";
import handleResponse from "../../lib/handleRequest";

export default function Game() {
  const { query } = useRouter();
  const ws = useRef<WebSocket>();

  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [gameFound, setGameFound] = useState<boolean>(false);

  useEffect(() => {
    if (!query.slug) return;
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e) => {
      try {
        const response = JSON.parse(e.data);
        handleResponse(response, setPlayers);
      } catch (err) {
        console.error(err);
      }
    });
    ws.current.addEventListener("open", () => {
      const request: JoinRequest = {
        method: "join",
        gameId: query.slug as string,
        player: {
          isAdmin: false,
          nickname: "guest",
          avatar: "/avatar/bugs.jpg",
        },
      };
      ws.current?.send(JSON.stringify(request));
    });

    return () => ws.current?.close();
  }, [query.slug]);

  return (
    <main>
      <div>
        {players.map((player) => (
          <div>
            <img src="/avatar/bugs.jpg" />
            <p>{player.nickname}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
