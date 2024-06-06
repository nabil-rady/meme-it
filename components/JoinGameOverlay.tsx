import { useRef } from "react";
import { IoMdClose } from "react-icons/io";

interface JoinGameOverlayProps {
  closeOverlay: () => void;
}

export default function JoinGameOverlay({
  closeOverlay,
}: JoinGameOverlayProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="join-game-overlay">
      <div className="body">
        <button
          className="close-button"
          onClick={() => {
            closeOverlay();
          }}
        >
          <IoMdClose size="24" className="icon" />
        </button>
        <h2 className="title">Join Game</h2>
        <div>
          <label>Enter Game Id</label>
          <input
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/${input.current?.value}`;
              }
            }}
            type="text"
          ></input>
        </div>
        <button
          className="button"
          type="submit"
          onClick={() => {
            window.location.href = `/${input.current?.value}`;
          }}
        >
          Join game
        </button>
      </div>
    </div>
  );
}
