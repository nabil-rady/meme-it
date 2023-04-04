import Image from "next/image";
import { IoMdClose } from "react-icons/io";

interface AvatarProps {
  avatar: string;
  closeAvatarSelect: () => void;
  changeAvatar: (src: string) => void;
}

export default function AvatarSelect({
  avatar,
  closeAvatarSelect,
  changeAvatar,
}: AvatarProps) {
  const avatars = Array.from(Array(12).keys()).map((n) => {
    const link = `/avatars/${n + 1}.jpg`;
    const size = "96";

    return (
      <Image
        key={`avatar${n + 1}`}
        src={link}
        alt=""
        width={size}
        height={size}
        className={`avatar ${avatar === link ? "selected" : ""}`}
        onClick={() => changeAvatar(link)}
      />
    );
  });

  return (
    <div className="avatar-select-overlay" onClick={closeAvatarSelect}>
      <div className="body" onClick={(e) => e.stopPropagation()}>
        <h2>pick an avatar</h2>
        <div className="avatars">{avatars}</div>
        <button className="close-button" onClick={closeAvatarSelect}>
          &nbsp;
          <IoMdClose size={26} className="icon" />
        </button>
      </div>
    </div>
  );
}
