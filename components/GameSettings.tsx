import { MutableRefObject, useState, useEffect } from "react";
import { GameInfo, UpdateGameRequestBody } from "../server/types";

interface GameSettingsProps {
  game: GameInfo;
  admin: boolean;
  ws: MutableRefObject<WebSocket | undefined>;
}

export default function GameSettings({ game, admin, ws }: GameSettingsProps) {
  const [rounds, setRounds] = useState<number>(game.rounds);
  const [maxPlayers, setMaxPlayers] = useState<number>(game.maxPlayers);
  const [firstRender, setFirstRender] = useState<boolean>(true);

  const updateGame = (rounds: number, maxPlayers: number) => {
    const updateGameRequest: UpdateGameRequestBody = {
      method: "updateGame",
      updatedGame: { rounds, maxPlayers },
    };
    ws.current?.send(JSON.stringify(updateGameRequest));
  };

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    updateGame(rounds, maxPlayers);
  }, [rounds, maxPlayers]);

  return (
    <div className={`game-options ${admin ? "" : "disabled"}`}>
      <label htmlFor="number-of-rounds">Number Of Rounds</label>
      <select
        id="number-of-rounds"
        value={admin ? rounds : game.rounds}
        onChange={(e) => {
          setRounds(parseInt(e.target.value));
        }}
        tabIndex={admin ? 0 : -1}
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
      <label htmlFor="number-of-players">Number Of Players</label>
      <select
        id="number-of-players"
        value={admin ? maxPlayers : game.maxPlayers}
        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
        tabIndex={admin ? 0 : -1}
      >
        <option value="6">6</option>
        <option value="8">8</option>
        <option value="10">10</option>
      </select>
    </div>
  );
}
