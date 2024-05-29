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
  SubmitCaptionsRequestBody,
  SubmitCaptionsResponseBody,
  EndCaptionPhaseResponseBody,
  MemeForReviewResponseBody,
  SubmitReviewRequestBody,
  SubmitReviewResponseBody,
  MemeResult,
  EndReviewPhaseResponseBody,
  EndResultPhaseResponseBody,
  RestartGameRequestBody,
  RestartGameResponseBody,
  TerminateGameRequestBody,
  ErrorResponseBody,
} from "../types";
import { DMeme, DMemeWithCaptionDetails } from "../../dbtypes";

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
    } else if (requestBody.method === "submitCaption") {
      return new SubmitCaptionsRequestHandler(
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
    } else if (requestBody.method === "restart") {
      return new RestartGameRequestHandler(
        requestBody,
        connection,
        logger,
        gameStore,
        playerStore
      );
    } else if (requestBody.method === "terminate") {
      return new TerminateGameRequestHandler(
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

  async getRandomMemes(n: number): Promise<DMemeWithCaptionDetails[]> {
    const totalNumber = await prisma.memes.count();

    if (totalNumber < n) {
      throw new Error("Database doesn't have enough memes.");
    }

    const randomMemeIds = await prisma.$queryRaw<
      Omit<DMeme, "url">[]
    >`SELECT id FROM \`Memes\` ORDER BY RAND() LIMIT ${n}`;

    return prisma.memes.findMany({
      where: {
        id: {
          in: randomMemeIds.map((el) => el.id),
        },
      },
      include: {
        captionsDetails: true,
      },
    });
  }

  async startCaptionPhase(game: Game) {
    game.setPhase("caption");
    this.gameStore.addGame(game);

    const currentRound = game.getGameInfo().currentRound;

    const players = game.getPlayers();
    const memes = await this.getRandomMemes(players.length);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const meme = memes[i];
      player.setCurrentMeme(meme);
      this.playerStore.addPlayer(player);

      if (currentRound === 1) {
        const startGameResponse: StartGameResponseBody = {
          method: "startGame",
          meme,
        };
        player.send(startGameResponse);
      } else {
        const endResultPhaseResponse: EndResultPhaseResponseBody = {
          method: "endResultPhase",
          end: false,
          meme,
        };
        player.send(endResultPhaseResponse);
      }
    }

    const timeoutId = setTimeout(() => {
      this.endCaptionPhase(game);
    }, 1000 * (60 + 5)); // Add extra 5 seconds for good UX.

    game.setTimeoutId(timeoutId);
    this.gameStore.addGame(game);

    this.logger.info(
      `Game ${game.getGameId()} caption phase has started and is in now in round ${currentRound}.`
    );
  }

  async sendMemeForReview(game: Game, memeIndex = 0) {
    if (!this.gameStore.getGame(game.getGameId())) return;
    if (memeIndex === game.getPlayers().length) {
      this.endReviewPhase(game);
      return;
    }

    const player = game.getPlayers()[memeIndex];
    const memeForReview: MemeForReview = {
      meme: player.getCurrentMeme()!,
      captions: player.getCurrentCaptions(),
      creatorPlayerId: player.getPlayerId(),
    };

    const memeReviewResponse: MemeForReviewResponseBody = {
      method: "memeForReview",
      meme: memeForReview,
    };
    game.broadcast(memeReviewResponse);

    const timeoutId = setTimeout(() => {
      this.sendMemeForReview(game, memeIndex + 1);
    }, 1000 * (15 + 2)); // Add extra 2 seconds for good UX.
    game.setTimeoutId(timeoutId);
    this.gameStore.addGame(game);

    this.logger.info(
      `Meme number ${
        memeIndex + 1
      } of game ${game.getGameId()} has been sent for review.`
    );
  }

  endCaptionPhase(game: Game) {
    game.setPhase("review");
    game.shufflePlayers();
    this.gameStore.addGame(game);

    const endCaptionPhaseResponse: EndCaptionPhaseResponseBody = {
      method: "endCaptionPhase",
    };
    game.broadcast(endCaptionPhaseResponse);

    this.sendMemeForReview(game);

    this.logger.info(
      `Game ${game.getGameId()} caption phase has ended and is now in its review phase.`
    );
  }

  endReviewPhase(game: Game) {
    game.setPhase("result");
    this.gameStore.addGame(game);

    const memes: MemeResult[] = game.getPlayers().map((player) => ({
      meme: player.getCurrentMeme()!,
      captions: player.getCurrentCaptions(),
      creatorPlayerId: player.getPlayerId(),
      upvotes: player.getRoundTotalUpvotes(game.getGameInfo().currentRound),
      downvotes: player.getRoundTotalDownvotes(game.getGameInfo().currentRound),
    }));

    for (const player of game.getPlayers()) {
      player.setCurrentCaptions(null);
      this.playerStore.addPlayer(player);
    }

    const endReviewPhaseResponse: EndReviewPhaseResponseBody = {
      method: "endReviewPhase",
      results: memes,
    };
    game.broadcast(endReviewPhaseResponse);

    const timeoutId = setTimeout(() => {
      this.endResultPhase(game);
    }, 1000 * (40 + 3)); // Add extra 3 seconds for good UX.
    game.setTimeoutId(timeoutId);
    this.gameStore.addGame(game);

    this.logger.info(
      `Game ${game.getGameId()} review phase has ended and is now in its result phase.`
    );
  }

  endResultPhase(game: Game) {
    if (game.getGameInfo().currentRound < game.getGameInfo().rounds) {
      game.incrementRound();
      this.startCaptionPhase(game);
    } else {
      game.setPhase("final");
      this.gameStore.addGame(game);

      const endResultPhaseResponse: EndResultPhaseResponseBody = {
        method: "endResultPhase",
        end: true,
      };
      game.broadcast(endResultPhaseResponse);
    }
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
    const errorResponse: ErrorResponseBody = {
      code: 403,
      error: "unauthorized",
    };
    this.connection.send(JSON.stringify(errorResponse));
  }

  send404Error(resourceType: "Game" | "Player", resourceID: string) {
    const requestType = this.getRequestType();
    this.logger.debug(
      `${resourceType} with id ${resourceID} not found when processing ${
        ["a", "e", "i", "o", "u"].includes(requestType[0]) ? "an" : "a"
      } "${requestType}" request.`
    );
    const errorResponse: ErrorResponseBody = {
      code: 404,
      error: `${resourceType} not found`,
    };
    this.connection.send(JSON.stringify(errorResponse));
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
      true,
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

    if (
      desiredGame.getPlayers().length === desiredGame.getGameInfo().maxPlayers
    ) {
      const errorResponse: ErrorResponseBody = {
        code: 403,
        error: "Lobby is full",
      };
      this.connection.send(JSON.stringify(errorResponse));

      this.logger.debug(
        `Player attempted to join lobby of game ${desiredGame.getGameId()} but its full.`
      );

      return;
    }

    const player = new Player(
      this.requestBody.player.nickname,
      this.requestBody.player.avatar,
      false,
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

    if (gameToStart.getPlayers().length == 1) {
      const errorResponse: ErrorResponseBody = {
        code: 403,
        error: "Cannot start game with only one player",
      };
      this.connection.send(JSON.stringify(errorResponse));
      return;
    }
    this.startCaptionPhase(gameToStart);
  }
}

class SubmitCaptionsRequestHandler extends RequestHandler {
  private requestBody: SubmitCaptionsRequestBody;

  constructor(
    requestBody: SubmitCaptionsRequestBody,
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
      const errorResponse: ErrorResponseBody = {
        code: 400,
        error: "invalid request",
      };
      this.connection.send(JSON.stringify(errorResponse));
      return;
    }

    if (game.getPhase() !== "caption") {
      const captionResponse: SubmitCaptionsResponseBody = {
        method: "submitCaption",
        success: false,
      };
      player.send(captionResponse);
      return;
    }

    player.setCurrentCaptions(this.requestBody.captions);
    this.playerStore.addPlayer(player);

    const captionResponse: SubmitCaptionsResponseBody = {
      method: "submitCaption",
      success: true,
    };
    player.send(captionResponse);

    this.logger.info(
      `Player ${playerId} submitted captions to his/her/their meme for round ${
        game.getGameInfo().currentRound
      }.`
    );

    if (game.getPlayers().every((player) => player.getCurrentCaptions())) {
      clearTimeout(game.getTimeoutId());
      this.endCaptionPhase(game);

      this.logger.info(
        `Players of game ${game.getGameId()} finished their captions for round ${
          game.getGameInfo().currentRound
        } before the alotted time.`
      );
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

    if (this.requestBody.playerToBeReviewedId === playerId) {
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

    this.logger.info(
      `Player ${playerId} submitted a review to the meme created by player ${playerToBeReviewed.getPlayerId()} in  round ${currentRound}, the meme now has ${playerToBeReviewed.getRoundTotalVotes(
        currentRound
      )}.`
    );
  }
}

class RestartGameRequestHandler extends RequestHandler {
  private requestBody: RestartGameRequestBody;

  constructor(
    requestBody: RestartGameRequestBody,
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

    const gameId = this.connection.gameId!;
    const gameToBeRestarted = this.gameStore.getGame(gameId);
    if (!gameToBeRestarted) {
      this.send404Error("Game", gameId);
      return;
    }

    if (!this.isAdmin(gameToBeRestarted)) {
      this.send403Error("Game", gameId);
      return;
    }

    gameToBeRestarted.restart();

    this.gameStore.addGame(gameToBeRestarted);
    for (const player of gameToBeRestarted.getPlayers()) {
      this.playerStore.addPlayer(player);
    }

    const restartGameResponse: RestartGameResponseBody = {
      method: "restart",
    };
    gameToBeRestarted.broadcast(restartGameResponse);

    this.logger.info(`Game ${gameId} restart and is now in its lobby phase.`);
  }
}

class TerminateGameRequestHandler extends RequestHandler {
  private requestBody: TerminateGameRequestBody;

  constructor(
    requestBody: TerminateGameRequestBody,
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

    const gameId = this.connection.gameId!;
    const gameToBeTerminated = this.gameStore.getGame(gameId);
    if (!gameToBeTerminated) {
      this.send404Error("Game", gameId);
      return;
    }

    if (!this.isAdmin(gameToBeTerminated)) {
      this.send403Error("Game", gameId);
      return;
    }

    gameToBeTerminated.terminate();
    this.playerStore.removeGamePlayers(gameToBeTerminated);
    this.gameStore.removeGame(gameToBeTerminated);

    this.logger.info(`Game ${gameToBeTerminated.getGameId()} terminated.`);
  }
}
