import { BsFillChatLeftTextFill } from "react-icons/bs";

interface OpenChatButtonProps {
  openChat: () => void;
  numberOfUnreadMessages: number;
}

export default function ChatOpenButton({
  openChat,
  numberOfUnreadMessages,
}: OpenChatButtonProps) {
  return (
    <div className="chat-open" onClick={() => openChat()}>
      {numberOfUnreadMessages !== 0 && (
        <div className="chat-unread-num">{numberOfUnreadMessages}</div>
      )}
      <BsFillChatLeftTextFill color="#133ea9" size="20" />
    </div>
  );
}
