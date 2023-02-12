import { useEffect, useRef, useState } from "react";
import { PlayerInfo, GameResponse, CreateRequest } from "../../server/types";

export default function CreateGamePage() {
  const ws = useRef<WebSocket>();

  const [gameActive, setGameActive] = useState<boolean>(false);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  const createGame = (nickname: string, avatar: string) => {
    const hostname = window.location.hostname;
    ws.current = new WebSocket(`ws://${hostname}:9090`);
    ws.current.addEventListener("message", (e) => {
      try {
        const response = JSON.parse(e.data) as GameResponse;
        if ("error" in response) {
          window.location.href = "/game";
        }
        if (response.method === "create") {
          window.history.pushState({}, "", `/game/${response.gameId}`);
          setGameActive(true);
          setPlayers([
            { id: response.adminId, nickname, avatar, isAdmin: true },
          ]);
        } else if (response.method === "join") {
          setPlayers(response.players);
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
          {player.nickname}
        </div>
      ))}
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
