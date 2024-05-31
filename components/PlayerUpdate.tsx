import Image from "next/image";
import { MutableRefObject, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { UpdatePlayerRequestBody } from "../server/types";

interface UpdateProps {
  avatar: string;
  nickname: string;
  avatarsTaken: string[];
  closePlayerUpdate: () => void;
  ws: MutableRefObject<WebSocket | undefined>;
}

export default function PlayerUpdate({
  avatar,
  nickname,
  avatarsTaken,
  closePlayerUpdate,
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

  return (
    <div className="player-update-overlay" onClick={closePlayerUpdate}>
      <div className="body" onClick={(e) => e.stopPropagation()}>
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
          onClick={
            nicknameNotEmpty
              ? () => {
                  updatePlayer();
                  closePlayerUpdate();
                }
              : () => setShowNicknameError(true)
          }
        >
          Update
        </button>
      </div>
    </div>
  );
}
