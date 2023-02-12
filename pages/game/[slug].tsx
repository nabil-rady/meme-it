import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  GameResponse,
  ErrorResponse,
  JoinRequest,
  PlayerInfo,
} from "../../server/types";

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
        const response = JSON.parse(e.data) as GameResponse | ErrorResponse;
        if ("error" in response) {
          window.location.href = "/game";
        } else if (response.method === "join") {
          setPlayers(response.players);
          setGameFound(true);
        } else if (response.method === "leave") {
          setPlayers((prevPlayers) =>
            prevPlayers.filter((player) => player.id !== response.player.id)
          );
        } else if (response.method === "terminate") {
          window.location.href = "/game";
        }
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
