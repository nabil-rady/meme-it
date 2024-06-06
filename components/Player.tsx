import { MutableRefObject, useState } from "react";
import { FaCrown } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";

import PlayerUpdate from "./PlayerUpdate";

import { PlayerInfo } from "../server/types";

interface PlayerProps {
  player: PlayerInfo;
  thisPlayer: boolean;
  showScore?: boolean;
  avatarsTaken?: string[];
  ws?: MutableRefObject<WebSocket | undefined>;
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
      {props.player.admin && props.ws ? (
        <FaCrown className="player-admin" size={30} />
      ) : null}
      <div className={`player-image${!props.player.inGame ? " left" : ""}`}>
        <img
          src={props.player.avatar}
          alt={`${props.player.nickname} avatar`}
          draggable={false}
        />
      </div>
      <div className="player-nickname">
        {props.player.nickname}
        {props.showScore ? ` (Score:  ${props.player.totalScore})` : null}
      </div>
      {props.thisPlayer && props.ws && (
        <button className="edit-name" onClick={openPlayerUpdate}>
          <HiPencilAlt size={20} />
        </button>
      )}
      {showPlayerUpdate && props.ws && props.avatarsTaken && (
        <PlayerUpdate
          joined
          avatar={props.player.avatar}
          nickname={props.player.nickname}
          closePlayerUpdate={closePlayerUpdate}
          submitInfo={() => {}}
          avatarsTaken={props.avatarsTaken}
          ws={props.ws}
        />
      )}
    </div>
  );
}
