import { Dispatch, MutableRefObject, SetStateAction } from "react";

import Dropdown from "../components/Dropdown";
import Invite from "../components/Invite";
import MemeComponent from "../components/Meme";
import Player from "../components/Player";
import ReviewPhase from "../components/ReviewPhase";

import { DMemeWithCaptionDetails } from "../dbtypes";

import {
  MemeForReview,
  GameInfo,
  PlayerInfo,
  CaptionRequestBody,
  StartGameRequestBody,
} from "../server/types";

const renderGameLobby = (
  game: GameInfo,
  thisPlayer: PlayerInfo,
  players: PlayerInfo[],
  ws: MutableRefObject<WebSocket | undefined>
) => {
  const startGame = () => {
    const startGameRequest: StartGameRequestBody = {
      method: "startGame",
    };
    ws.current?.send(JSON.stringify(startGameRequest));
  };

  return (
    <>
      <main className="lobby">
        <h1 className="title">Meme It</h1>
        <div className="lobby-container">
          <div className="players-container">
            <h2>Players ({players.length})</h2>
            <div className="players">
              {players.map((player) => (
                <Player
                  key={player.id}
                  player={player}
                  thisPlayer={player.id === thisPlayer.id}
                  ws={ws}
                />
              ))}
            </div>
          </div>
          <div className="options">
            <div
              className={`game-options ${thisPlayer.admin ? "" : "disabled"}`}
            >
              <Dropdown
                label="Number of rounds"
                name="number-of-rounds"
                options={["1", "2", "3"]}
                admin={thisPlayer.admin}
              />
              <Dropdown
                label="Number of players"
                name="number-of-players"
                options={["6", "8", "10"]}
                admin={thisPlayer.admin}
              />
            </div>
            <div className="buttons">
              <Invite id={(game as GameInfo).id} />
              <button
                className={`button start-button ${
                  thisPlayer.admin ? "" : "disabled"
                }`}
                onClick={startGame}
              >
                Start game
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const renderGameCaption = (
  meme: DMemeWithCaptionDetails,
  captions: string[],
  setCaptions: Dispatch<SetStateAction<string[]>>,
  ws: MutableRefObject<WebSocket | undefined>
) => {
  const sendCaptions = async () => {
    const captionRequest: CaptionRequestBody = {
      method: "caption",
      captions,
    };
    ws.current?.send(JSON.stringify(captionRequest));
  };

  return (
    <div className="caption">
      <h1 className="title">Meme It</h1>
      <MemeComponent
        meme={meme}
        captions={captions}
        setCaptions={setCaptions}
        sendCaptions={sendCaptions}
      />
    </div>
  );
};

const renderGameReview = (
  thisPlayer: PlayerInfo,
  memesForReview: MemeForReview[]
) => {
  return (
    <div className="review">
      <h1 className="title">Meme It</h1>
      <ReviewPhase thisPlayer={thisPlayer} memes={memesForReview} />
    </div>
  );
};

export default function renderGameUI(
  game: GameInfo | undefined,
  thisPlayer: PlayerInfo | undefined,
  players: PlayerInfo[],
  meme: DMemeWithCaptionDetails | undefined,
  memesforReviews: MemeForReview[],
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
    return renderGameCaption(meme, captions, setCaptions, ws);
  } else if (game.phase === "review") {
    return renderGameReview(thisPlayer, memesforReviews);
  } else {
    return <h1>Not Implemented</h1>;
  }
}
