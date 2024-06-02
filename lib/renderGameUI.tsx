import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Oval } from "react-loader-spinner";

import GameSettings from "../components/GameSettings";
import Invite from "../components/Invite";
import MemeComponent from "../components/Meme";
import Player from "../components/Player";
import ReviewPhase from "../components/ReviewPhase";
import ResultPhase from "../components/ResultPhase";
import FinalPhase from "../components/FinalPhase";

import { DMemeWithCaptionDetails } from "../dbtypes";

import {
  MemeForReview,
  GameInfo,
  PlayerInfo,
  SubmitCaptionsRequestBody,
  StartGameRequestBody,
  MemeResult,
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
        <h2 className="game-id">Game Id: {game.id}</h2>
        <div className="lobby-container">
          <div className="game-container">
            <div className="players-container">
              <h2>Players ({players.length})</h2>
              <div className="players">
                {players.map((player) => (
                  <Player
                    key={player.id}
                    player={player}
                    thisPlayer={player.id === thisPlayer.id}
                    avatarsTaken={players.map((player) => player.avatar)}
                    ws={ws}
                  />
                ))}
              </div>
            </div>
            <div className="options">
              <GameSettings game={game} admin={thisPlayer.admin} ws={ws} />
            </div>
          </div>
          <div className="buttons">
            <Invite id={(game as GameInfo).id} />
            <button
              className={`button start-button ${
                thisPlayer.admin ? "" : "disabled"
              }`}
              onClick={startGame}
              tabIndex={thisPlayer.admin ? 0 : -1}
            >
              Start game
            </button>
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
    if (!ws.current) {
      return;
    }
    const captionRequest: SubmitCaptionsRequestBody = {
      method: "submitCaption",
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
  memeForReview: MemeForReview,
  thisPlayer: PlayerInfo,
  upvoted: boolean | null,
  setUpvoted: Dispatch<SetStateAction<boolean | null>>,
  ws: MutableRefObject<WebSocket | undefined>
) => {
  return (
    <div className="review">
      <h1 className="title">Meme It</h1>
      <ReviewPhase
        meme={memeForReview}
        thisPlayer={thisPlayer}
        upvoted={upvoted}
        setUpvoted={setUpvoted}
        ws={ws}
      />
    </div>
  );
};

const renderGameResult = (
  thisPlayer: PlayerInfo,
  players: PlayerInfo[],
  memesResults: MemeResult[]
) => {
  return (
    <div className="result">
      <h1 className="title">Meme It</h1>
      <ResultPhase
        thisPlayer={thisPlayer}
        players={players}
        memesResults={memesResults}
      />
    </div>
  );
};

const renderGameFinal = (
  thisPlayer: PlayerInfo,
  players: PlayerInfo[],
  ws: MutableRefObject<WebSocket | undefined>
) => {
  return (
    <div className="final">
      <h1 className="title">Meme It</h1>
      <FinalPhase thisPlayer={thisPlayer} players={players} ws={ws} />
    </div>
  );
};

export default function renderGameUI(
  game: GameInfo | undefined,
  thisPlayer: PlayerInfo | undefined,
  players: PlayerInfo[],
  meme: DMemeWithCaptionDetails | undefined,
  memeforReviews: MemeForReview | undefined,
  upvoted: boolean | null,
  memesResults: MemeResult[],
  captions: string[],
  setCaptions: Dispatch<SetStateAction<string[]>>,
  setUpvoted: Dispatch<SetStateAction<boolean | null>>,
  ws: MutableRefObject<WebSocket | undefined>
) {
  // TODO: Error handling
  if (!game || !thisPlayer)
    return (
      <div className="loading">
        <Oval
          wrapperStyle={{
            justifyContent: "center",
          }}
          secondaryColor="#f5f2f2"
          color="#133ea9"
        />
        <h2>Loading...</h2>
      </div>
    );
  if (game.phase === "lobby") {
    return renderGameLobby(game, thisPlayer, players, ws);
  } else if (game.phase === "caption") {
    if (!meme) return <h1 className="loading">Loading...</h1>;
    return renderGameCaption(meme, captions, setCaptions, ws);
  } else if (game.phase === "review") {
    if (!memeforReviews) return <h1 className="loading">Loading...</h1>;
    return renderGameReview(
      memeforReviews,
      thisPlayer,
      upvoted,
      setUpvoted,
      ws
    );
  } else if (game.phase === "result") {
    return renderGameResult(thisPlayer, players, memesResults);
  } else {
    return renderGameFinal(thisPlayer, players, ws);
  }
}
