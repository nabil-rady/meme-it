import Image from "next/image";
import { MutableRefObject, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { JoinRequestBody, UpdatePlayerRequestBody } from "../server/types";

interface UpdateProps {
  joined: boolean;
  avatar: string;
  nickname: string;
  avatarsTaken: string[];
  closePlayerUpdate: () => void;
  submitInfo: () => void;
  ws: MutableRefObject<WebSocket | undefined>;
}

export default function PlayerUpdate({
  joined,
  avatar,
  nickname,
  avatarsTaken,
  closePlayerUpdate,
  submitInfo,
  ws,
}: UpdateProps) {
  const [newAvatar, setNewNAvatar] = useState<string>(avatar);
  const [newNickname, setNewNickname] = useState<string>(nickname);
  const [showNicknameError, setShowNicknameError] = useState<boolean>(false);

  const nicknameNotEmpty = /^(?!\s*$).+/.test(newNickname);

  const avatars = Array.from(Array(12).keys()).map((n) => {
    const link = `/avatars/${n}.jpg`;
    const size = "96";

    const className =
      "avatar" +
      (newAvatar === link
        ? " selected"
        : avatarsTaken.includes(link) && link !== avatar
        ? " taken"
        : "");

    return (
      <Image
        key={`avatar${n}`}
        src={link}
        alt=""
        width={size}
        height={size}
        className={className}
        onClick={() => setNewNAvatar(link)}
        draggable={false}
      />
    );
  });

  const updatePlayer = () => {
    const updatePlayerRequest: UpdatePlayerRequestBody = {
      method: "updatePlayer",
      updatedPlayer: { avatar: newAvatar, nickname: newNickname },
    };
    ws.current?.send(JSON.stringify(updatePlayerRequest));
  };

  const joinPlayer = () => {
    const joinRequest: JoinRequestBody = {
      gameId: location.pathname.slice(1),
      method: "join",
      avatar: newAvatar,
      nickname: newNickname,
    };

    ws.current?.send(JSON.stringify(joinRequest));
    submitInfo();
  };

  const onClick = () => {
    if (joined) {
      if (nicknameNotEmpty) {
        updatePlayer();
        closePlayerUpdate();
      } else {
        setShowNicknameError(true);
      }
    } else {
      if (nicknameNotEmpty) {
        joinPlayer();
      } else {
        setShowNicknameError(true);
      }
    }
  };

  return (
    <div className="player-update-overlay" onClick={closePlayerUpdate}>
      <div className="body" onClick={(e) => e.stopPropagation()}>
        {!joined && <h2>Select your avatar and nickname</h2>}
        <button className="close-button" onClick={closePlayerUpdate}>
          &nbsp;
          <IoMdClose size={26} className="icon" />
        </button>
        <div className="avatars">{avatars}</div>
        <label>
          Nickname:
          <input
            type="text"
            maxLength={15}
            value={newNickname}
            className={showNicknameError ? "error" : ""}
            onChange={(e) => {
              setNewNickname(e.target.value);
              setShowNicknameError(false);
            }}
          ></input>
        </label>
        <button
          className="button"
          onClick={() => {
            onClick();
          }}
        >
          {joined ? "Update" : "Join"}
        </button>
      </div>
    </div>
  );
}
