import { MutableRefObject, useState } from "react";
import { FaCrown } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";

import PlayerUpdate from "./PlayerUpdate";

import { PlayerInfo } from "../server/types";

interface PlayerProps {
  player: PlayerInfo;
  thisPlayer: boolean;
  ws: MutableRefObject<WebSocket | undefined>;
}

export default function Player(props: PlayerProps) {
  const [showPlayerUpdate, setShowPlayerUpdate] = useState<boolean>(false);

  const openPlayerUpdate = () => {
    setShowPlayerUpdate(true);
  };

  const closePlayerUpdate = () => {
    setShowPlayerUpdate(false);
  };

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
      <div className="player-nickname">{props.player.nickname}</div>
      {props.thisPlayer && (
        <button className="edit-name" tabIndex={-1} onClick={openPlayerUpdate}>
          <HiPencilAlt size={20} />
        </button>
      )}
      {showPlayerUpdate && (
        <PlayerUpdate
          avatar={props.player.avatar}
          nickname={props.player.nickname}
          closePlayerUpdate={closePlayerUpdate}
          ws={props.ws}
        />
      )}
    </div>
  );
}
