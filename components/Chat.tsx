import { useRef } from "react";
import Image from "next/image";
import moment from "moment";

import OpenChatButton from "./OpenChatButton";
import CloseChatButton from "./CloseChatButton";
import ChatTextbox from "./ChatTextbox";

import { ChatMessage } from "../server/types";

interface ChatProps {
  chatLogs: ChatMessage[];
  chatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
}

export default function Chat({
  chatLogs,
  chatOpen,
  openChat,
  closeChat,
  sendMessage,
}: ChatProps) {
  const chatDOMElement = useRef<HTMLDivElement>(null);

  const numberOfUnreadMessages = chatLogs.reduce(
    (acc: number, curr: ChatMessage) => {
      if (curr.read !== true) {
        return acc + 1;
      }
      return acc;
    },
    0
  );

  return (
    <>
      <OpenChatButton
        openChat={() => {
          openChat();
        }}
        numberOfUnreadMessages={numberOfUnreadMessages}
      />
      <div ref={chatDOMElement} className={`chat${chatOpen ? " open" : ""}`}>
        <CloseChatButton closeChat={closeChat} />
        <div className="chat-messages">
          {chatLogs.map((chatMessage) => (
            <div
              key={chatMessage.timestamp}
              className={`chat-message${
                chatMessage.isSystemMessage ? " system" : ""
              }`}
            >
              {chatMessage.sentBy && (
                <div>
                  <Image
                    width="40"
                    height="40"
                    className="chat-message-avatar"
                    alt={`${chatMessage.sentBy.nickname} avatar`}
                    src={chatMessage.sentBy.avatar}
                  />
                </div>
              )}
              <p>
                {chatMessage.sentBy && (
                  <span className="chat-message-nickname">
                    {chatMessage.sentBy.nickname}:&nbsp;
                  </span>
                )}
                <span className="chat-message-content">
                  {chatMessage.content}&nbsp;
                </span>
                {chatMessage.sentBy && (
                  <span className="chat-message-time">
                    ({moment(chatMessage.timestamp).fromNow()})
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
        <ChatTextbox sendMessage={sendMessage} />
      </div>
    </>
  );
}
