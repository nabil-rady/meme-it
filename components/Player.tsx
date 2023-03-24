import { FaCrown } from "react-icons/fa";

import { PlayerInfo } from "../server/types";

interface PlayerProps {
  player: PlayerInfo;
  thisPlayer: boolean;
}

export default function Player(props: PlayerProps) {
  return (
    <div className="player">
      {props.player.admin ? (
        <FaCrown className="player-admin" size={30} />
      ) : null}
      <div className="player-image">
        <img
          alt={`${props.player.nickname} avatar`}
          src={props.player.avatar}
        />
      </div>
      <span className="player-nickname">
        {props.player.nickname} {props.thisPlayer ? " (You)" : null}
      </span>
    </div>
  );
}
