import { Logger } from "winston";

import { Game } from "./Game";
import { GameStore } from "./GameStore";
import { Player } from "./Player";
import { PlayerStore } from "./PlayerStore";

import prisma from "../../db";

import {
  MemeForReview,
  GameConnection,
  GameRequestBody,
  CreateRequestBody,
  CreateResponseBody,
  JoinRequestBody,
  JoinResponseBody,
  UpdateGameRequestBody,
  UpdateGameResponseBody,
  UpdatePlayerRequestBody,
  UpdatePlayerResponseBody,
  StartGameRequestBody,
  StartGameResponseBody,
  CaptionRequestBody,
  CaptionResponseBody,
  EndCaptionPhaseResponseBody,
  SubmitReviewRequestBody,
  SubmitReviewResponseBody,
} from "../types";
import { DMemeWithCaptionDetails } from "../../dbtypes";

export abstract class RequestHandler {
  protected readonly connection: GameConnection;
  protected readonly logger: Logger;
  protected readonly gameStore: GameStore;
  protected readonly playerStore: PlayerStore;

  constructor(
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    this.connection = connection;
    this.logger = logger;
    this.gameStore = gameStore;
    this.playerStore = playerStore;
  }

  static createRequestHandler(
    requestBody: GameRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ): RequestHandler {
    if (requestBody.method === "create") {
      return new CreateRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "join") {
      return new JoinRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "updateGame") {
      return new UpdateGameRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "updatePlayer") {
      return new UpdatePlayerRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "startGame") {
      return new StartGameRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "caption") {
      return new CaptionRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "submitReview") {
      return new SubmitReviewRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else {
      throw new Error("Incorrect request body format.");
    }
  }

  isValidConnection(): boolean {
    return !!this.connection.playerId && !!this.connection.gameId;
  }

  isAdmin(game: Game): boolean {
    return game.getAdmin()?.getPlayerId() === this.connection.playerId;
  }

  endCaptionPhase(game: Game) {
    game.setPhase("review");
    this.gameStore.addGame(game);

    const memes: MemeForReview[] = game.getPlayers().map((player) => ({
      meme: player.getCurrentMeme()!,
      captions: player.getCurrentCaptions(),
      creatorPlayerId: player.getPlayerId(),
    }));

    for (const player of game.getPlayers()) {
      player.setCurrentCaptions(null);
      this.playerStore.addPlayer(player);
    }

    const endCaptionPhaseResponse: EndCaptionPhaseResponseBody = {
      method: "endCaptionPhase",
      memes,
    };
    game.broadcast(endCaptionPhaseResponse);
  }

  getRequestType(): string {
    const thisClassName = this.constructor.name;
    return thisClassName.substring(0, thisClassName.indexOf("RequestHandler"));
  }

  send403Error(resourceType: "Game" | "Player", resourceID: string) {
    const requestType = this.getRequestType();
    this.logger.debug(
      `Requester ${
        this.connection.playerId
      } doesn't have access to edit ${resourceType} with id ${resourceID} with ${
        ["a", "e", "i", "o", "u"].includes(requestType[0]) ? "an" : "a"
      } ${requestType} request.`
    );
    this.connection.send(JSON.stringify({ error: "unauthorized" }));
  }

  send404Error(resourceType: "Game" | "Player", resourceID: string) {
    const requestType = this.getRequestType();
    this.logger.debug(
      `${resourceType} with id ${resourceID} not found when processing ${
        ["a", "e", "i", "o", "u"].includes(requestType[0]) ? "an" : "a"
      } "${requestType}" request.`
    );
    this.connection.send(
      JSON.stringify({ error: `${resourceType} not found` })
    );
  }

  abstract handle(): void;
}

class CreateRequestHandler extends RequestHandler {
  private readonly requestBody: CreateRequestBody;

  constructor(
    requestBody: CreateRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  handle() {
    const admin = new Player(
      this.requestBody.admin.nickname,
      this.requestBody.admin.avatar,
      this.requestBody.admin.admin,
      this.connection
    );
    this.playerStore.addPlayer(admin);

    const game = new Game(
      this.requestBody.game.rounds,
      this.requestBody.game.maxPlayers,
      admin
    );
    this.gameStore.addGame(game);

    this.connection.gameId = game.getGameId();
    this.connection.playerId = admin.getPlayerId();

    const response: CreateResponseBody = {
      method: "create",
      game: game.getGameInfo(),
      admin: admin.getPlayerInfo(),
    };

    admin.send(response);

    this.logger.info(
      `Game ${game.getGameId()} was created by player ${admin.getPlayerId()}.`
    );
  }
}

class JoinRequestHandler extends RequestHandler {
  private readonly requestBody: JoinRequestBody;

  constructor(
    requestBody: JoinRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  handle() {
    const desiredGame = this.gameStore.getGame(this.requestBody.gameId);

    if (!desiredGame) {
      this.send404Error("Game", this.requestBody.gameId);
      return;
    }

    const player = new Player(
      this.requestBody.player.nickname,
      this.requestBody.player.avatar,
      this.requestBody.player.admin,
      this.connection
    );
    this.playerStore.addPlayer(player);

    desiredGame.addPlayer(player);

    this.connection.gameId = desiredGame.getGameId();
    this.connection.playerId = player.getPlayerId();

    const playersInfos = desiredGame.getPlayersInfos();

    const desiredGameInfo = desiredGame.getGameInfo();

    const response: JoinResponseBody = {
      method: "join",
      players: playersInfos,
      game: desiredGameInfo,
    };

    desiredGame.broadcast(response);

    this.logger.info(
      `Player ${player.getPlayerId()} joined game ${desiredGame.getGameId()}.`
    );
  }
}

class UpdateGameRequestHandler extends RequestHandler {
  private readonly requestBody: UpdateGameRequestBody;

  constructor(
    requestBody: UpdateGameRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  handle() {
    if (!this.isValidConnection()) {
      this.logger.debug(
        "Attempted to update a player from an invalid connection."
      );
      return;
    }

    const gameId = this.connection.gameId!;
    const gameToBeUpdated = this.gameStore.getGame(gameId);
    if (!gameToBeUpdated) {
      this.send404Error("Game", gameId);
      return;
    }

    if (!this.isAdmin(gameToBeUpdated)) {
      this.send403Error("Game", gameId);
      return;
    }

    const updatedGameInfo = this.requestBody.updatedGame;
    gameToBeUpdated.setGameInfo({
      ...gameToBeUpdated.getGameInfo(),
      ...updatedGameInfo,
    });
    this.gameStore.addGame(gameToBeUpdated);

    const updateGameResponse: UpdateGameResponseBody = {
      method: "updateGame",
      updatedGame: gameToBeUpdated.getGameInfo(),
    };
    gameToBeUpdated.broadcast(updateGameResponse);

    this.logger.info(
      `Game ${gameToBeUpdated.getGameId()} got updated with ${JSON.stringify(
        updatedGameInfo
      )}.`
    );
  }
}

class UpdatePlayerRequestHandler extends RequestHandler {
  private readonly requestBody: UpdatePlayerRequestBody;

  constructor(
    requestBody: UpdatePlayerRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  handle() {
    if (!this.isValidConnection()) {
      this.logger.debug(
        "Attempted to update a player from an invalid connection."
      );
      return;
    }

    const playerId = this.connection.playerId!;
    const playerToBeUpdated = this.playerStore.getPlayer(playerId);
    if (!playerToBeUpdated) {
      this.send404Error("Player", playerId);
      return;
    }

    const updatedPlayerInfo = this.requestBody.updatedPlayer;
    playerToBeUpdated.setPlayerInfo({
      ...playerToBeUpdated.getPlayerInfo(),
      ...updatedPlayerInfo,
    });
    this.playerStore.addPlayer(playerToBeUpdated);

    const gameOfUpdatePlayer =
      this.gameStore.getGamePlayedByPlayer(playerToBeUpdated);
    if (gameOfUpdatePlayer) {
      const updatePlayerResponse: UpdatePlayerResponseBody = {
        method: "updatePlayer",
        updatedPlayer: playerToBeUpdated.getPlayerInfo(),
      };
      gameOfUpdatePlayer.broadcast(updatePlayerResponse);
    }

    this.logger.info(
      `Player ${playerToBeUpdated.getPlayerId()} got updated with ${JSON.stringify(
        updatedPlayerInfo
      )}.`
    );
  }
}

class StartGameRequestHandler extends RequestHandler {
  private requestBody: StartGameRequestBody;

  constructor(
    requestBody: StartGameRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  async handle() {
    if (!this.isValidConnection()) {
      this.logger.debug(
        "Attempted to update a player from an invalid connection."
      );
      return;
    }

    const gameId = this.connection.gameId!;
    const gameToStart = this.gameStore.getGame(gameId);
    if (!gameToStart) {
      this.send404Error("Game", gameId);
      return;
    }

    if (!this.isAdmin(gameToStart)) {
      this.send403Error("Game", gameId);
      return;
    }

    gameToStart.setPhase("caption");
    this.gameStore.addGame(gameToStart);

    const numberOfMemes = await prisma.memes.count();
    const skip = Math.floor(Math.random() * numberOfMemes);
    const meme: DMemeWithCaptionDetails | undefined = (
      await prisma.memes.findMany({
        skip,
        take: 1,
        include: {
          captionsDetails: true,
        },
      })
    ).at(0);

    if (!meme) {
      throw new Error("Database has no memes.");
    }
    // TODO: Different meme for every player
    for (const player of gameToStart.getPlayers()) {
      player.setCurrentMeme(meme);
      this.playerStore.addPlayer(player);

      const startGameResponse: StartGameResponseBody = {
        method: "startGame",
        meme,
      };
      player.send(startGameResponse);
    }

    const timeoutId = setTimeout(() => {
      this.endCaptionPhase(gameToStart);
    }, 1000 * (60 + 5)); // Add extra 5 seconds for good UX.

    gameToStart.setTimeoutId(timeoutId);
    this.gameStore.addGame(gameToStart);
  }
}

class CaptionRequestHandler extends RequestHandler {
  private requestBody: CaptionRequestBody;

  constructor(
    requestBody: CaptionRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  handle() {
    if (!this.isValidConnection()) {
      this.logger.debug(
        "Attempted to send captions from an invalid connection."
      );
      return;
    }

    const playerId = this.connection.playerId!;
    const player = this.playerStore.getPlayer(playerId);
    if (!player) {
      this.send404Error("Player", playerId);
      return;
    }

    const gameId = this.connection.gameId!;
    const game = this.gameStore.getGame(gameId);
    if (!game) {
      this.send404Error("Game", gameId);
      return;
    }

    if (
      this.requestBody.captions.length !==
      player.getCurrentMeme()?.captionsDetails.length
    ) {
      this.connection.send(JSON.stringify({ error: "invalid request" }));
      return;
    }

    if (game.getPhase() !== "caption") {
      const captionResponse: CaptionResponseBody = {
        method: "caption",
        success: false,
      };
      player.send(captionResponse);
      return;
    }

    player.setCurrentCaptions(this.requestBody.captions);
    this.playerStore.addPlayer(player);

    const captionResponse: CaptionResponseBody = {
      method: "caption",
      success: true,
    };
    player.send(captionResponse);

    if (game.getPlayers().every((player) => player.getCurrentCaptions())) {
      clearTimeout(game.getTimeoutId());
      this.endCaptionPhase(game);
    }
  }
}

class SubmitReviewRequestHandler extends RequestHandler {
  private requestBody: SubmitReviewRequestBody;

  constructor(
    requestBody: SubmitReviewRequestBody,
    connection: GameConnection,
    logger: Logger,
    gameStore: GameStore,
    playerStore: PlayerStore
  ) {
    super(connection, logger, gameStore, playerStore);
    this.requestBody = requestBody;
  }

  handle() {
    if (!this.isValidConnection()) {
      this.logger.debug(
        "Attempted to submit a review from an invalid connection."
      );
      return;
    }

    const playerId = this.connection.playerId!;
    const player = this.playerStore.getPlayer(playerId);
    if (!player) {
      this.send404Error("Player", playerId);
      return;
    }

    const gameId = this.connection.gameId!;
    const game = this.gameStore.getGame(gameId);
    if (!game) {
      this.send404Error("Game", gameId);
      return;
    }
    if (game.getPhase() !== "review") {
      const captionResponse: SubmitReviewResponseBody = {
        method: "submitReview",
        success: false,
      };
      this.connection.send(JSON.stringify(captionResponse));
      return;
    }

    const currentRound = game.getGameInfo().currentRound;

    const playerToBeReviewed = this.playerStore.getPlayer(
      this.requestBody.playerToBeReviewedId
    );
    if (!playerToBeReviewed) {
      const submitReviewResponse: SubmitReviewResponseBody = {
        method: "submitReview",
        success: false,
      };
      this.connection.send(JSON.stringify(submitReviewResponse));
      return;
    }

    if (this.requestBody.like)
      playerToBeReviewed.upvote(playerId, currentRound);
    else playerToBeReviewed.downvote(playerId, currentRound);
    this.playerStore.addPlayer(playerToBeReviewed);

    const submitReviewResponse: SubmitReviewResponseBody = {
      method: "submitReview",
      success: true,
    };
    this.connection.send(JSON.stringify(submitReviewResponse));
  }
}
