import { Dispatch, SetStateAction } from "react";
import { DMemeWithCaptionDetails } from "../dbtypes";
import {
  GameInfo,
  PlayerInfo,
  GameResponseBody,
  CreateResponseBody,
  JoinResponseBody,
  UpdateGameResponseBody,
  UpdatePlayerResponseBody,
  LeaveResponseBody,
  TerminateResponseBody,
  StartGameResponseBody,
  CaptionResponseBody,
  EndCaptionPhaseResponseBody,
} from "../server/types";

export abstract class ResponseHandler {
  protected readonly setGame: Dispatch<SetStateAction<GameInfo | undefined>>;
  protected readonly setThisPlayer: Dispatch<
    SetStateAction<PlayerInfo | undefined>
  >;
  protected readonly setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>;
  protected readonly setMeme: Dispatch<
    SetStateAction<DMemeWithCaptionDetails | undefined>
  >;
  protected readonly setCaptions: Dispatch<SetStateAction<string[]>>;

  constructor(
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    this.setGame = setGame;
    this.setThisPlayer = setThisPlayer;
    this.setPlayers = setPlayers;
    this.setMeme = setMeme;
    this.setCaptions = setCaptions;
  }

  static createResponseHandler(
    responseBody: GameResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ): ResponseHandler {
    if (responseBody.method === "create") {
      return new CreateResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "join") {
      return new JoinResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "updateGame") {
      return new UpdateGameResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "updatePlayer") {
      return new UpdatePlayerResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "startGame") {
      return new StartGameResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "caption") {
      return new CaptionResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "endCaptionPhase") {
      return new EndCaptionPhaseResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "leave") {
      return new LeaveResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else if (responseBody.method === "terminate") {
      return new TerminateResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setCaptions
      );
    } else {
      throw new Error("Incorrect response body format.");
    }
  }

  abstract handle(): void;
}

class CreateResponseHandler extends ResponseHandler {
  private readonly responseBody: CreateResponseBody;

  constructor(
    responseBody: CreateResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame(this.responseBody.game);
    this.setThisPlayer(this.responseBody.admin);
    this.setPlayers([this.responseBody.admin]);
  }
}

class JoinResponseHandler extends ResponseHandler {
  private readonly responseBody: JoinResponseBody;

  constructor(
    responseBody: JoinResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame(this.responseBody.game);
    this.setThisPlayer((thisPlayer) =>
      thisPlayer ? thisPlayer : this.responseBody.players.at(-1)
    );
    this.setPlayers(this.responseBody.players);
  }
}

class UpdateGameResponseHandler extends ResponseHandler {
  private readonly responseBody: UpdateGameResponseBody;

  constructor(
    responseBody: UpdateGameResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame(this.responseBody.updatedGame);
  }
}

class UpdatePlayerResponseHandler extends ResponseHandler {
  private readonly responseBody: UpdatePlayerResponseBody;

  constructor(
    responseBody: UpdatePlayerResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const playerToUpdateIndex = newPlayers.findIndex(
        (playerInfo) => playerInfo.id === this.responseBody.updatedPlayer.id
      );
      if (playerToUpdateIndex !== -1)
        newPlayers[playerToUpdateIndex] = {
          ...newPlayers[playerToUpdateIndex],
          ...this.responseBody.updatedPlayer,
        };
      return newPlayers;
    });
  }
}

class StartGameResponseHandler extends ResponseHandler {
  private readonly responseBody: StartGameResponseBody;

  constructor(
    responseBody: StartGameResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame((prevGame) =>
      prevGame ? { ...prevGame, phase: "caption" } : prevGame
    );
    this.setMeme(this.responseBody.meme);
    this.setCaptions(
      new Array(this.responseBody.meme.captionsDetails.length)
        .fill("")
        .map((_, index) => `Caption ${index + 1}`)
    );
  }
}

class CaptionResponseHandler extends ResponseHandler {
  private readonly responseBody: CaptionResponseBody;

  constructor(
    responseBody: CaptionResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    // TODO: Error handling
  }
}

class EndCaptionPhaseResponseHandler extends ResponseHandler {
  private readonly responseBody: EndCaptionPhaseResponseBody;

  constructor(
    responseBody: EndCaptionPhaseResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame((game) => {
      if (!game) return game;
      return {
        ...game,
        phase: "review",
      };
    });
  }
}

class LeaveResponseHandler extends ResponseHandler {
  private readonly responseBody: LeaveResponseBody;

  constructor(
    responseBody: LeaveResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    this.setPlayers((prevPlayers) => {
      if (this.responseBody.newAdmin) {
        const newAdminIndex = prevPlayers.findIndex(
          (player) => player.id === this.responseBody.newAdmin!.id
        );
        if (newAdminIndex !== -1) {
          prevPlayers[newAdminIndex].admin = true;
          return prevPlayers.filter(
            (player) => player.id !== this.responseBody.player.id
          );
        }
      }
      return prevPlayers.filter(
        (player) => player.id !== this.responseBody.player.id
      );
    });
  }
}

class TerminateResponseHandler extends ResponseHandler {
  private readonly responseBody: TerminateResponseBody;

  constructor(
    responseBody: TerminateResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setCaptions: Dispatch<SetStateAction<string[]>>
  ) {
    super(setGame, setThisPlayer, setPlayers, setMeme, setCaptions);
    this.responseBody = responseBody;
  }

  handle() {
    // TODO: Termination handling here
    window.location.reload();
  }
}
