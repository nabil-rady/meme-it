import http from "http";

import winston from "winston";
import {
  Message,
  request as Request,
  server as WebSocketServer,
} from "websocket";

import {
  CreateRequest,
  JoinRequest,
  UpdatePlayerRequest,
  UpdateGameRequest,
  GameRequest,
  CreateResponse,
  JoinResponse,
  UpdatePlayerResponse,
  UpdateGameResponse,
  LeaveResponse,
  GameConnection,
} from "./types";

import { PlayerStore, GameStore, Player, Game } from "./lib";

const PORT = 9090;

const playerStore = PlayerStore.getInstace();
const gameStore = GameStore.getInstace();

const { combine, printf, timestamp } = winston.format;

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `${new Date(timestamp).toLocaleString()} - ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV !== "production" ? "info" : "debug",
  format: combine(timestamp(), loggerFormat),
  transports: [new winston.transports.Console()],
});

function createGame(
  request: CreateRequest,
  connection: GameConnection,
  playerStore: PlayerStore,
  gameStore: GameStore
) {
  const admin = new Player(
    request.admin.nickname,
    request.admin.avatar,
    request.admin.admin,
    connection
  );
  playerStore.addPlayer(admin);

  const game = new Game(request.game.rounds, request.game.maxPlayers, admin);
  gameStore.addGame(game);

  connection.gameId = game.getGameId();
  connection.playerId = admin.getPlayerId();

  const response: CreateResponse = {
    method: "create",
    game: game.getGameInfo(),
    admin: admin.getPlayerInfo(),
  };

  admin.send(response);

  logger.info(
    `Game ${game.getGameId()} was created by player ${admin.getPlayerId()}.`
  );
}

function joinGame(
  request: JoinRequest,
  connection: GameConnection,
  game: Game,
  playerStore: PlayerStore
) {
  const player = new Player(
    request.player.nickname,
    request.player.avatar,
    request.player.admin,
    connection
  );
  playerStore.addPlayer(player);

  game.addPlayer(player);

  connection.gameId = game.getGameId();
  connection.playerId = player.getPlayerId();

  const playersInfos = game.getPlayersInfos();

  const desiredGameInfo = game.getGameInfo();

  const response: JoinResponse = {
    method: "join",
    players: playersInfos,
    game: desiredGameInfo,
  };

  game.broadcast(response);

  logger.info(
    `Player ${player.getPlayerId()} joined game ${game.getGameId()}.`
  );
}

function updatePlayer(
  request: UpdatePlayerRequest,
  playerToBeUpdated: Player,
  playerStore: PlayerStore
) {
  const updatedPlayerInfo = request.updatedPlayer;
  playerToBeUpdated.setPlayerInfo({
    ...playerToBeUpdated.getPlayerInfo(),
    ...updatedPlayerInfo,
  });
  playerStore.addPlayer(playerToBeUpdated);

  const gameOfUpdatePlayer = gameStore.getGamePlayedByPlayer(playerToBeUpdated);
  if (gameOfUpdatePlayer) {
    const updatePlayerResponse: UpdatePlayerResponse = {
      method: "updatePlayer",
      updatedPlayer: updatedPlayerInfo,
    };
    gameOfUpdatePlayer.broadcast(updatePlayerResponse);
  }

  logger.info(
    `Player ${playerToBeUpdated.getPlayerId()} got updated with ${JSON.stringify(
      updatedPlayerInfo
    )}.`
  );
}

function updateGame(
  request: UpdateGameRequest,
  gameToBeUpdated: Game,
  gameStore: GameStore
) {
  const updatedGameInfo = request.updatedGame;
  gameToBeUpdated.setGameInfo({
    ...gameToBeUpdated.getGameInfo(),
    ...updatedGameInfo,
  });
  gameStore.addGame(gameToBeUpdated);

  const updateGameResponse: UpdateGameResponse = {
    method: "updateGame",
    updatedGame: updatedGameInfo,
  };
  gameToBeUpdated.broadcast(updateGameResponse);

  logger.info(
    `Game ${gameToBeUpdated.getGameId()} got updated with ${JSON.stringify(
      updatedGameInfo
    )}.`
  );
}

function handleClosingConnection(
  connection: GameConnection,
  playerStore: PlayerStore,
  gameStore: GameStore
) {
  if (connection.playerId && connection.gameId) {
    const player = playerStore.getPlayer(connection.playerId);
    const leftGame = gameStore.getGame(connection.gameId);

    if (!player || !leftGame) {
      return;
    }

    leftGame.removePlayer(player);

    let newAdmin: Player | undefined;
    if (leftGame.getPlayersInfos().length === 0) {
      leftGame.terminate();
      playerStore.removeGamePlayers(leftGame);
      gameStore.removeGame(leftGame);

      logger.info(`Game ${leftGame.getGameId()} terminated.`);
      return;
    }

    if (player.isAdmin()) {
      newAdmin = leftGame.getEarliestPlayer();
      if (newAdmin) {
        newAdmin.makeAdmin();
        playerStore.addPlayer(newAdmin);

        logger.info(
          `Player ${newAdmin.getPlayerId()} has become the admin of game ${leftGame.getGameId()}.`
        );
      }
    }

    const playerInfo = player.getPlayerInfo();
    const response: LeaveResponse = {
      method: "leave",
      player: playerInfo,
      newAdmin: newAdmin ? newAdmin.getPlayerInfo() : null,
    };

    playerStore.removePlayer(player);
    leftGame.broadcast(response);

    logger.info(
      `Player ${player.getPlayerId()} left game ${leftGame.getGameId()}.`
    );
  }
}

function main(port: number, playerStore: PlayerStore, gameStore: GameStore) {
  const httpServer = http.createServer();
  httpServer.listen(port, () => {
    logger.info(`Websocket server listening on port ${port}.`);
  });

  const websocketServer = new WebSocketServer({ httpServer });

  websocketServer.on("request", (request: Request) => {
    const connection: GameConnection = request.accept(null, request.origin);
    connection.on("close", () => {
      handleClosingConnection(connection, playerStore, gameStore);
    });
    connection.on("message", async (message: Message) => {
      if (message.type !== "utf8") {
        logger.debug("Request ignored because it's in binary.");
        return;
      }
      try {
        const request = JSON.parse(message.utf8Data) as GameRequest;
        if (request.method === "create") {
          createGame(request, connection, playerStore, gameStore);
        } else if (request.method === "join") {
          const desiredGame = gameStore.getGame(request.gameId);

          if (!desiredGame) {
            logger.debug("Attempted to join a game that doesn't exist.");
            connection.send(JSON.stringify({ error: "game not found" }));
            connection.close();
            return;
          }
          joinGame(request, connection, desiredGame, playerStore);
        } else if (request.method === "updatePlayer") {
          const playerToBeUpdated = playerStore.getPlayer(
            request.updatedPlayer.id
          );
          if (!playerToBeUpdated) {
            logger.debug("Attempted to update a player that doesn't exist.");
            connection.send(JSON.stringify({ error: "player not found" }));
            return;
          }
          updatePlayer(request, playerToBeUpdated, playerStore);
        } else if (request.method === "updateGame") {
          const gameToBeUpdated = gameStore.getGame(request.updatedGame.id);
          if (!gameToBeUpdated) {
            logger.debug("Attempted to update a game that doesn't exist.");
            connection.send(JSON.stringify({ error: "game not found" }));
            return;
          }
          updateGame(request, gameToBeUpdated, gameStore);
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          logger.debug("Request ignored because it's not in JSON format.");
        } else {
          logger.error(err);
        }
      }
    });
  });
}

main(PORT, playerStore, gameStore);
