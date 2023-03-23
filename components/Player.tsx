import { FaCrown } from "react-icons/fa";

import { PlayerInfo } from "../server/types";

interface PlayerProps {
  player: PlayerInfo;
}

export default function Player(props: PlayerProps) {
  return (
    <div className="player">
      {props.player.admin ? <FaCrown className="player-admin" /> : null}
      <div className="player-image">
        <img
          alt={`${props.player.nickname} avatar`}
          src={props.player.avatar}
        />
      </div>
      <span className="player-nickname">{props.player.nickname}</span>
    </div>
  );
}
