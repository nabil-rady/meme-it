import { useEffect, useRef, useState } from "react";
import handleResponse from "../../lib/handleRequest";
import {
  PlayerInfo,
  GameResponse,
  CreateRequest,
  UpdatePlayerRequest,
} from "../../server/types";

export default function CreateGamePage() {
  const ws = useRef<WebSocket>();

  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerInfo>();

  const gameActive = players.length !== 0;

  const createGame = (nickname: string, avatar: string) => {
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e) => {
      try {
        const response = JSON.parse(e.data) as GameResponse;
        handleResponse(
          response,
          setCurrentPlayer,
          setPlayers,
          nickname,
          avatar
        );
      } catch (err) {
        console.error(err);
      }
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

  return gameActive ? (
    <div>
      {players.map((player) => (
        <div key={player.id}>
          <img src={player.avatar} />
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
  ) : (
    <main>
      <form
        onSubmit={(e: any) => {
          e.preventDefault();
          createGame(e.target.elements[0].value, "/avatar/bugs.jpg");
        }}
      >
        <input name="nickname" type="text" placeholder="Nickname" />
        <button type="submit"> Create private game</button>
      </form>
    </main>
  );
}
