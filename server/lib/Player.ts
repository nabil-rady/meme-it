import { v4 as uuid } from "uuid";
import { DMemeWithCaptionDetails } from "../../dbtypes";
import { GameConnection, PlayerInfo, GameResponseBody } from "../types";

export class Player {
  private readonly id: string;
  private nickname: string;
  private avatar: string;
  private admin: boolean;
  private readonly joinedAt: number;
  private readonly connection: GameConnection;
  private currentMeme: DMemeWithCaptionDetails | null;
  private currentCaptions: string[] | null;

  constructor(
    nickname: string,
    avatar: string,
    admin: boolean,
    connection: GameConnection
  ) {
    this.id = uuid();
    this.nickname = nickname;
    this.avatar = avatar;
    this.admin = admin;
    this.joinedAt = Date.now().valueOf();
    this.connection = connection;
    this.currentMeme = null;
    this.currentCaptions = null;
  }

  getPlayerId(): string {
    return this.id;
  }

  getPlayerInfo(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      avatar: this.avatar,
      admin: this.admin,
      joinedAt: this.joinedAt,
    };
  }

  getPlayerGameId(): string | undefined {
    return this.connection.gameId;
  }

  setPlayerInfo(playerInfo: PlayerInfo) {
    this.nickname = playerInfo.nickname;
    this.avatar = playerInfo.avatar;
  }

  isAdmin(): boolean {
    return this.admin;
  }

  makeAdmin() {
    this.admin = true;
  }

  getCurrentMeme(): DMemeWithCaptionDetails | null {
    return this.currentMeme;
  }

  setCurrentMeme(meme: DMemeWithCaptionDetails | null) {
    this.currentMeme = meme;
  }

  getCurrentCaptions(): string[] | null {
    return this.currentCaptions;
  }

  setCurrentCaptions(captions: string[] | null) {
    this.currentCaptions = captions;
  }

  send(message: GameResponseBody) {
    this.connection.send(JSON.stringify(message));
  }
}
