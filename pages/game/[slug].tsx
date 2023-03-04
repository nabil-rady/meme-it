import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  JoinRequest,
  UpdatePlayerRequest,
  PlayerInfo,
} from "../../server/types";
import handleResponse from "../../lib/handleRequest";

export default function Game() {
  const { query } = useRouter();
  const ws = useRef<WebSocket>();

  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerInfo>();

  useEffect(() => {
    if (!query.slug) return;
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e) => {
      try {
        const response = JSON.parse(e.data);
        handleResponse(response, setCurrentPlayer, setPlayers);
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
        {currentPlayer && (
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const updatePlayerRequest: UpdatePlayerRequest = {
                method: "updatePlayer",
                updatedPlayer: {
                  ...currentPlayer,
                  nickname: e.target.elements[0].value,
                },
              };
              ws.current?.send(JSON.stringify(updatePlayerRequest));
            }}
          >
            <input type="text" />
            <button type="submit">Change nickname</button>
          </form>
        )}
      </div>
    </main>
  );
}
