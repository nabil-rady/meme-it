import http from "http";

import winston from "winston";
import {
  Message,
  request as Request,
  server as WebSocketServer,
} from "websocket";

import {
  ChatMessage,
  GameConnection,
  GameRequestBody,
  LeaveResponseBody,
} from "./types";

import { GameStore } from "./lib/GameStore";
import { Player } from "./lib/Player";
import { PlayerStore } from "./lib/PlayerStore";
import { RequestHandler } from "./lib/RequestHandler";

const PORT = 9090;

const { combine, printf, timestamp } = winston.format;

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `${new Date(timestamp).toLocaleString()} - ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(timestamp(), loggerFormat),
  transports: [new winston.transports.Console()],
});

function handleClosingConnection(connection: GameConnection) {
  if (connection.playerId && connection.gameId) {
    const playerStore = PlayerStore.getInstance();
    const gameStore = GameStore.getInstance();

    const player = playerStore.getPlayer(connection.playerId);
    const leftGame = gameStore.getGame(connection.gameId);

    if (!player || !leftGame) {
      return;
    }

    const leftPlayerNickname = player.getPlayerInfo().nickname;
    leftGame.removePlayer(player);

    let newAdmin: Player | undefined;
    if (leftGame.hasNoPlayers()) {
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

        logger.info(
          `Player ${newAdmin.getPlayerId()} has become the admin of game ${leftGame.getGameId()}.`
        );
      }
    }

    if (leftGame.getPhase() === "lobby") {
      leftGame.removeInactivePlayers();
      playerStore.removeInactivePlayers(leftGame);
    }

    const playerInfo = player.getPlayerInfo();
    const messages: ChatMessage[] = [
      {
        isSystemMessage: true,
        content: `${leftPlayerNickname} left the game`,
        sentBy: null,
        timestamp: Date.now(),
      },
    ];
    if (newAdmin) {
      messages.push({
        isSystemMessage: true,
        content: `${newAdmin.getPlayerInfo().nickname} is now the admin`,
        sentBy: null,
        timestamp: Date.now(),
      });
    }
    const response: LeaveResponseBody = {
      method: "leave",
      player: playerInfo,
      restOfPlayers: leftGame.getPlayersInfos(),
      newAdmin: newAdmin ? newAdmin.getPlayerInfo() : null,
      messages,
    };
    leftGame.broadcast(response);

    console.log(leftGame.getPlayersInfos());

    logger.info(
      `Player ${player.getPlayerId()} left game ${leftGame.getGameId()}.`
    );
  }
}

function main(port: number) {
  const httpServer = http.createServer();
  httpServer.listen(port, () => {
    logger.info(`Websocket server listening on port ${port}.`);
  });

  const websocketServer = new WebSocketServer({ httpServer });

  websocketServer.on("request", (request: Request) => {
    const connection: GameConnection = request.accept(null, request.origin);
    connection.on("close", () => {
      handleClosingConnection(connection);
    });
    connection.on("message", async (message: Message) => {
      if (message.type !== "utf8") {
        logger.debug("Request ignored because it's in binary.");
        return;
      }
      try {
        const requestBody = JSON.parse(message.utf8Data) as GameRequestBody;

        const requestHandler = RequestHandler.createRequestHandler(
          requestBody,
          connection,
          logger,
          GameStore.getInstance(),
          PlayerStore.getInstance()
        );

        requestHandler.handle();
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

main(PORT);
