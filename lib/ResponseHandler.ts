import { Dispatch, SetStateAction } from "react";
import { DMemeWithCaptionDetails } from "../dbtypes";
import {
  MemeForReview,
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
  SubmitCaptionsResponseBody,
  EndCaptionPhaseResponseBody,
  MemeForReviewResponseBody,
  SubmitReviewResponseBody,
  MemeResult,
  ChatMessage,
  SendMessageResponseBody,
  EndReviewPhaseResponseBody,
  EndResultPhaseResponseBody,
  RestartGameResponseBody,
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
  protected readonly setMemeForReview: Dispatch<
    SetStateAction<MemeForReview | undefined>
  >;
  protected readonly setUpvoted: Dispatch<SetStateAction<boolean | null>>;
  protected readonly setMemesResults: Dispatch<SetStateAction<MemeResult[]>>;
  protected readonly setCaptions: Dispatch<SetStateAction<string[]>>;
  protected readonly setNotificationMessage: Dispatch<SetStateAction<string>>;
  protected readonly setIsNotificationError: Dispatch<SetStateAction<boolean>>;
  protected readonly setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>;

  constructor(
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    this.setGame = setGame;
    this.setThisPlayer = setThisPlayer;
    this.setPlayers = setPlayers;
    this.setMeme = setMeme;
    this.setMemeForReview = setMemeForReview;
    this.setUpvoted = setUpvoted;
    this.setMemesResults = setMemesResults;
    this.setCaptions = setCaptions;
    this.setNotificationMessage = setNotificationMessage;
    this.setIsNotificationError = setIsNotificationError;
    this.setChatLogs = setChatLogs;
  }

  static createResponseHandler(
    responseBody: GameResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ): ResponseHandler {
    if (responseBody.method === "create") {
      return new CreateResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "join") {
      return new JoinResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "updateGame") {
      return new UpdateGameResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "updatePlayer") {
      return new UpdatePlayerResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "startGame") {
      return new StartGameResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "submitCaption") {
      return new CaptionResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "endCaptionPhase") {
      return new EndCaptionPhaseResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "memeForReview") {
      return new MemeForReviewResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "submitReview") {
      return new SubmitReviewResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "endReviewPhase") {
      return new EndReviewPhaseResponsHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "endResultPhase") {
      return new EndResultPhaseResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "sendMessage") {
      return new SendMessageResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "restart") {
      return new RestartGameResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "leave") {
      return new LeaveResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
      );
    } else if (responseBody.method === "terminate") {
      return new TerminateResponseHandler(
        responseBody,
        setGame,
        setThisPlayer,
        setPlayers,
        setMeme,
        setMemeForReview,
        setUpvoted,
        setMemesResults,
        setCaptions,
        setNotificationMessage,
        setIsNotificationError,
        setChatLogs
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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
  private readonly responseBody: SubmitCaptionsResponseBody;

  constructor(
    responseBody: SubmitCaptionsResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
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

class MemeForReviewResponseHandler extends ResponseHandler {
  private readonly responseBody: MemeForReviewResponseBody;

  constructor(
    responseBody: MemeForReviewResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }

  handle() {
    this.setMemeForReview(this.responseBody.meme);
  }
}

class SubmitReviewResponseHandler extends ResponseHandler {
  private readonly responseBody: SubmitReviewResponseBody;

  constructor(
    responseBody: SubmitReviewResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }

  handle() {
    if (this.responseBody.success) {
      this.setNotificationMessage("Vote sent successfully");
      this.setIsNotificationError(false);
    } else {
      this.setUpvoted(null);
      this.setNotificationMessage(
        "Error while sending your vote, please vote again"
      );
      this.setIsNotificationError(true);
    }
  }
}

class EndReviewPhaseResponsHandler extends ResponseHandler {
  private readonly responseBody: EndReviewPhaseResponseBody;

  constructor(
    responseBody: EndReviewPhaseResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame((game) => {
      if (!game) return game;
      return { ...game, phase: "result" };
    });
    this.setPlayers((players) => {
      const newPlayers = [...players];
      for (const memeResult of this.responseBody.results) {
        for (let i = 0; i < newPlayers.length; i++) {
          if (memeResult.creatorPlayerId === newPlayers[i].id) {
            newPlayers[i].totalScore +=
              memeResult.upvotes - memeResult.downvotes;
            break;
          }
        }
      }
      return newPlayers;
    });
    this.setMemeForReview(undefined);
    this.setMemesResults(this.responseBody.results);
  }
}

class EndResultPhaseResponseHandler extends ResponseHandler {
  private readonly responseBody: EndResultPhaseResponseBody;

  constructor(
    responseBody: EndResultPhaseResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }

  handle() {
    this.setGame((game) => {
      if (!game) return game;
      return {
        ...game,
        phase: this.responseBody.end ? "final" : "caption",
        currentRound: this.responseBody.end
          ? game.currentRound
          : game.currentRound + 1,
      };
    });
    this.setMeme(this.responseBody.end ? undefined : this.responseBody.meme);
    this.setCaptions(
      this.responseBody.end
        ? []
        : new Array(this.responseBody.meme.captionsDetails.length)
            .fill("")
            .map((_, index) => `Caption ${index + 1}`)
    );
  }
}

class SendMessageResponseHandler extends ResponseHandler {
  private readonly responseBody: SendMessageResponseBody;

  constructor(
    responseBody: SendMessageResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }
  handle() {
    this.setChatLogs((prevLogs) => [...prevLogs, this.responseBody.message]);
  }
}

class RestartGameResponseHandler extends ResponseHandler {
  private readonly responseBody: RestartGameResponseBody;

  constructor(
    responseBody: RestartGameResponseBody,
    setGame: Dispatch<SetStateAction<GameInfo | undefined>>,
    setThisPlayer: Dispatch<SetStateAction<PlayerInfo | undefined>>,
    setPlayers: Dispatch<SetStateAction<PlayerInfo[]>>,
    setMeme: Dispatch<SetStateAction<DMemeWithCaptionDetails | undefined>>,
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }
  handle() {
    this.setGame((game) => {
      if (!game) return game;
      return {
        ...game,
        phase: "lobby",
        currentRound: 1,
      };
    });
    this.setPlayers(this.responseBody.players);
    this.setThisPlayer((prevThisPlayer) => {
      if (!prevThisPlayer) return prevThisPlayer;
      return {
        ...prevThisPlayer,
        totalScore: 0,
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }

  handle() {
    this.setThisPlayer((prevThisPlayer) => {
      if (!prevThisPlayer) return prevThisPlayer;
      if (prevThisPlayer.id === this.responseBody.newAdmin?.id) {
        return {
          ...prevThisPlayer,
          admin: true,
        };
      }
      return prevThisPlayer;
    });
    this.setPlayers(this.responseBody.restOfPlayers);
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
    setMemeForReview: Dispatch<SetStateAction<MemeForReview | undefined>>,
    setUpvoted: Dispatch<SetStateAction<boolean | null>>,
    setMemesResults: Dispatch<SetStateAction<MemeResult[]>>,
    setCaptions: Dispatch<SetStateAction<string[]>>,
    setNotificationMessage: Dispatch<SetStateAction<string>>,
    setIsNotificationError: Dispatch<SetStateAction<boolean>>,
    setChatLogs: Dispatch<SetStateAction<ChatMessage[]>>
  ) {
    super(
      setGame,
      setThisPlayer,
      setPlayers,
      setMeme,
      setMemeForReview,
      setUpvoted,
      setMemesResults,
      setCaptions,
      setNotificationMessage,
      setIsNotificationError,
      setChatLogs
    );
    this.responseBody = responseBody;
  }

  handle() {
    window.location.href = "/?terminated=true";
  }
}
