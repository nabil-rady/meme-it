import { v4 as uuid } from "uuid";
import { DMemeWithCaptionDetails } from "../../dbtypes";
import { Votes, GameConnection, PlayerInfo, GameResponseBody } from "../types";

export class Player {
  private readonly id: string;
  private nickname: string;
  private avatar: string;
  private admin: boolean;
  private inGame: boolean;
  private readonly joinedAt: number;
  private readonly connection: GameConnection;
  private currentMeme: DMemeWithCaptionDetails | null;
  private currentMemeRound: number | null;
  private currentCaptions: string[] | null;
  private votes: Votes;

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
    this.inGame = true;
    this.joinedAt = Date.now().valueOf();
    this.connection = connection;
    this.currentMeme = null;
    this.currentMemeRound = null;
    this.currentCaptions = null;
    this.votes = {};
  }

  getPlayerId(): string {
    return this.id;
  }

  getPlayerInfo(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      avatar: this.avatar,
      inGame: this.inGame,
      admin: this.admin,
      joinedAt: this.joinedAt,
      totalScore: this.totalScore,
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

  getCurrentMemeRound(): number | null {
    return this.currentMemeRound;
  }

  setCurrentMemeRound(currentMemeRound: number) {
    this.currentMemeRound = currentMemeRound;
  }

  getCurrentCaptions(): string[] | null {
    return this.currentCaptions;
  }

  setCurrentCaptions(captions: string[] | null) {
    this.currentCaptions = captions;
  }

  getVotes(): Votes {
    return this.votes;
  }

  getRoundTotalUpvotes(round: number): number {
    let totalUpvotes = 0;
    for (const key in this.votes) {
      const split = key.split("|");
      if (split.length !== 2) continue;
      if (!(parseInt(split[1]) === round)) continue;
      if (this.votes[key]) totalUpvotes++;
    }
    return totalUpvotes;
  }

  getRoundTotalDownvotes(round: number): number {
    let totalDownvotes = 0;
    for (const key in this.votes) {
      const split = key.split("|");
      if (split.length !== 2) continue;
      if (!(parseInt(split[1]) === round)) continue;
      if (!this.votes[key]) totalDownvotes++;
    }
    return totalDownvotes;
  }

  getRoundTotalVotes(round: number): number {
    let totalVotes = 0;
    for (const key in this.votes) {
      const split = key.split("|");
      if (split.length !== 2) continue;
      if (!(parseInt(split[1]) === round)) continue;
      if (this.votes[key]) totalVotes++;
      else totalVotes--;
    }
    return totalVotes;
  }

  get totalScore(): number {
    let totalScore = 0;
    for (const key in this.votes) {
      if (this.votes[key]) totalScore++;
      else totalScore--;
    }
    return totalScore;
  }

  upvote(playerId: string, round: number) {
    this.votes[`${playerId}|${round}`] = true;
  }

  downvote(playerId: string, round: number) {
    this.votes[`${playerId}|${round}`] = false;
  }

  reset() {
    this.votes = {};
    this.currentCaptions = [];
    this.currentMeme = null;
  }

  leaveGame() {
    this.inGame = false;
  }

  send(message: GameResponseBody) {
    this.connection.send(JSON.stringify(message));
  }
}
