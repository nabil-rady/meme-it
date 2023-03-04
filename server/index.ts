import http from "http";
import {
  Message,
  request as Request,
  server as WebSocketServer,
} from "websocket";

import {
  CreateRequest,
  JoinRequest,
  UpdatePlayerRequest,
  GameRequest,
  CreateResponse,
  JoinResponse,
  UpdatePlayerResponse,
  LeaveResponse,
  GameConnection,
} from "./types";

import { PlayerStore, GameStore, Player, Game } from "./lib";

const PORT = 9090;

const playerStore = PlayerStore.getInstace();
const gameStore = GameStore.getInstace();

function createGame(
  request: CreateRequest,
  connection: GameConnection,
  playerStore: PlayerStore,
  gameStore: GameStore
): void {
  const admin = new Player(
    request.admin.nickname,
    request.admin.avatar,
    request.admin.isAdmin,
    connection
  );
  playerStore.addPlayer(admin);

  const game = new Game(request.game.rounds, request.game.maxPlayers, admin);
  gameStore.addGame(game);

  connection.gameId = game.id;
  connection.playerId = admin.id;

  const response: CreateResponse = {
    method: "create",
    gameId: game.id,
    adminId: admin.id,
  };

  admin.send(response);
}

function joinGame(
  request: JoinRequest,
  connection: GameConnection,
  game: Game,
  playerStore: PlayerStore
): void {
  const player = new Player(
    request.player.nickname,
    request.player.avatar,
    request.player.isAdmin,
    connection
  );
  playerStore.addPlayer(player);

  game.addPlayer(player);

  connection.gameId = game.id;
  connection.playerId = player.id;

  const playersInfos = game.getPlayersInfos();

  const desiredGameInfo = game.getGameInfo();

  const response: JoinResponse = {
    method: "join",
    players: playersInfos,
    game: desiredGameInfo,
  };

  game.broadcast(response);
}

function updatePlayer(
  request: UpdatePlayerRequest,
  playerToBeUpdated: Player,
  playerStore: PlayerStore
): void {
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
}

function handleClosingConnection(
  connection: GameConnection,
  playerStore: PlayerStore,
  gameStore: GameStore
): void {
  if (connection.playerId && connection.gameId) {
    const player = playerStore.getPlayer(connection.playerId);
    const leftGame = gameStore.getGame(connection.gameId);

    if (!player || !leftGame) {
      return;
    }

    if (player.isAdmin) {
      leftGame.terminate();
      playerStore.removeGamePlayers(leftGame);
      gameStore.removeGame(leftGame);
      return;
    }

    const playerInfo = player.getPlayerInfo();

    const response: LeaveResponse = {
      method: "leave",
      player: playerInfo,
    };

    leftGame.broadcast(response);

    leftGame.removePlayer(player);
    playerStore.removePlayer(player);
  }
}

function main(
  port: number,
  playerStore: PlayerStore,
  gameStore: GameStore
): void {
  const httpServer = http.createServer();
  httpServer.listen(port, () => {
    console.log(`Websocket server listening on port 9090.`);
  });

  const websocketServer = new WebSocketServer({ httpServer });

  websocketServer.on("request", (request: Request) => {
    const connection: GameConnection = request.accept(null, request.origin);
    connection.on("close", () => {
      handleClosingConnection(connection, playerStore, gameStore);
    });
    connection.on("message", async (message: Message) => {
      if (message.type === "utf8") {
        try {
          const request = JSON.parse(message.utf8Data) as GameRequest;
          if (request.method === "create") {
            createGame(request, connection, playerStore, gameStore);
          } else if (request.method === "join") {
            const desiredGame = gameStore.getGame(request.gameId);

            if (!desiredGame) {
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
              connection.send(JSON.stringify({ error: "player not found" }));
              return;
            }
            updatePlayer(request, playerToBeUpdated, playerStore);
          }
        } catch (err) {
          if (err instanceof SyntaxError) {
            console.log("Request ignored because it's not in JSON format.");
          } else {
            console.error(err);
          }
        }
      }
    });
  });
}

main(PORT, playerStore, gameStore);
