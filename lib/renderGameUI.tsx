import { Dispatch, MutableRefObject, SetStateAction } from "react";

import Dropdown from "../components/Dropdown";
import Invite from "../components/Invite";
import MemeComponent from "../components/Meme";
import Player from "../components/Player";
import { DMemeWithCaptionDetails } from "../dbtypes";

import { GameInfo, PlayerInfo, StartGameRequestBody } from "../server/types";

const renderGameLobby = (
  game: GameInfo,
  thisPlayer: PlayerInfo,
  players: PlayerInfo[],
  ws: MutableRefObject<WebSocket | undefined>
) => {
  const startGame = () => {
    const startGameRequest: StartGameRequestBody = {
      method: "startGame",
      gameToStart: game,
    };
    ws.current?.send(JSON.stringify(startGameRequest));
  };

  return (
    <>
      <main className="home lobby">
        <h1>Meme It</h1>
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
              <Invite id={(game as GameInfo).id} />
              <button className="button start-button" onClick={startGame}>
                Start game
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default function renderGameUI(
  game: GameInfo | undefined,
  thisPlayer: PlayerInfo | undefined,
  players: PlayerInfo[],
  meme: DMemeWithCaptionDetails | undefined,
  captions: string[],
  setCaptions: Dispatch<SetStateAction<string[]>>,
  ws: MutableRefObject<WebSocket | undefined>
) {
  // TODO: Error handling
  if (!game || !thisPlayer) return <h1 className="loading">Loading...</h1>;
  if (game.phase === "lobby") {
    return renderGameLobby(game, thisPlayer, players, ws);
  } else if (game.phase === "caption") {
    if (!meme) return <h1 className="loading">Loading...</h1>;
    return (
      <MemeComponent
        meme={meme}
        captions={captions}
        setCaptions={setCaptions}
      />
    );
  } else {
    return <h1>Not Implemented</h1>;
  }
}
