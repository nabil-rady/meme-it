import { IoMdClose } from "react-icons/io";

interface CloseChatButtonProps {
  closeChat: () => void;
}

export default function ChatCloseButton({ closeChat }: CloseChatButtonProps) {
  return (
    <div
      className="chat-close"
      onClick={() => {
        closeChat();
      }}
    >
      <IoMdClose size="24" color="#f5f2f2" />
    </div>
  );
}
