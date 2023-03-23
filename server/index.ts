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

function createGame(
  request: CreateRequest,
  connection: GameConnection,
  playerStore: PlayerStore,
  gameStore: GameStore
): void {
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

function updateGame(
  request: UpdateGameRequest,
  gameToBeUpdated: Game,
  gameStore: GameStore
): void {
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

    leftGame.removePlayer(player);

    let newAdmin: Player | undefined;
    if (leftGame.getPlayersInfos().length === 0) {
      console.log("Game terminated.");
      leftGame.terminate();
      playerStore.removeGamePlayers(leftGame);
      gameStore.removeGame(leftGame);
      return;
    }

    if (player.isAdmin()) {
      newAdmin = leftGame.getEarliestPlayer();
      if (newAdmin) {
        newAdmin.makeAdmin();
        playerStore.addPlayer(newAdmin);
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
  }
}

function main(
  port: number,
  playerStore: PlayerStore,
  gameStore: GameStore
): void {
  const httpServer = http.createServer();
  httpServer.listen(port, () => {
    console.log(`Websocket server listening on port ${port}.`);
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
          } else if (request.method === "updateGame") {
            const gameToBeUpdated = gameStore.getGame(request.updatedGame.id);
            if (!gameToBeUpdated) {
              connection.send(JSON.stringify({ error: "game not found" }));
              return;
            }
            updateGame(request, gameToBeUpdated, gameStore);
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
