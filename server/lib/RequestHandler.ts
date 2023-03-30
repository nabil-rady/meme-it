import { Logger } from "winston";

import { Game } from "./Game";
import { GameStore } from "./GameStore";
import { Player } from "./Player";
import { PlayerStore } from "./PlayerStore";

import {
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
} from "../types";

abstract class RequestHandler {
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
      this.logger.debug("Attempted to join a game that doesn't exist.");
      this.connection.send(JSON.stringify({ error: "game not found" }));
      this.connection.close();
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
    const gameToBeUpdated = this.gameStore.getGame(
      this.requestBody.updatedGame.id
    );
    if (!gameToBeUpdated) {
      this.logger.debug("Attempted to update a game that doesn't exist.");
      this.connection.send(JSON.stringify({ error: "game not found" }));
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
      updatedGame: updatedGameInfo,
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
    const playerToBeUpdated = this.playerStore.getPlayer(
      this.requestBody.updatedPlayer.id
    );
    if (!playerToBeUpdated) {
      this.logger.debug("Attempted to update a player that doesn't exist.");
      this.connection.send(JSON.stringify({ error: "player not found" }));
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
        updatedPlayer: updatedPlayerInfo,
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

export function createRequestHandler(
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
  } else {
    throw new Error("Incorrect request body format.");
  }
}
