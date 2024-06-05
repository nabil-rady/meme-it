import { useRef } from "react";
import { IoMdSend } from "react-icons/io";

interface ChatTextboxProps {
  sendMessage: (message: string) => void;
}

export default function ChatTextbox({ sendMessage }: ChatTextboxProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="chat-textbox">
      <input
        ref={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage(input.current!.value);
            input.current!.value = "";
          }
        }}
        type="text"
      />
      <button hidden type="submit" />
      <div
        className="send"
        onClick={() => {
          sendMessage(input.current!.value);
          input.current!.value = "";
        }}
      >
        <IoMdSend color="#133ea9" size="25" />
      </div>
    </div>
  );
}
