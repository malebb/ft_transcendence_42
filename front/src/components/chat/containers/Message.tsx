import { useEffect, useState } from "react";
import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import InputButton from "../inputs/InputButton";

import "./message.style.css";

// interface partialMessage {
//   username: string;
//   message: string;
//   time: number;
// }

// interface messageTmp extends partialMessage {
//   roomId: string;
// }

interface Message {
  username: string;
  message: string;
  sendAt: Date;
  hours: number;
  minutes: number;
  room: boolean;
  roomId: string;
}

function MessagesContainer() {
  let newMessage: Message = {
    username: "username",
    message: "",
    sendAt: new Date(),
    hours: 0,
    minutes: 0,
    room: false,
    roomId: "",
  };

  // declaration d'une variable d'etat
  // useState = hook d'etat (pour une variable)
  const [stateMessage, setStateMessage] = useState<Message[]>([
    {
      ...newMessage,
    },
  ]);

  let currentMessage: Message = { ...newMessage };

  const socket = SocketContext();

  useEffect(() => {
    socket.on("ROOM_MESSAGE", (message) => {
      setStateMessage([...stateMessage, message]);
    });
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

	
	// https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
    // Prevent the browser from reloading the page
    event.preventDefault();

    // Read the form data
    // @ts-ignore
    const form = new FormData(event.target);
    const inputMessage = form.get("messageInput")?.toString()?.trim();

    if (!inputMessage?.length) return;

    // debugger;

    const dateTS = new Date();
    currentMessage = {
      ...newMessage,
      message: inputMessage,
      sendAt: dateTS,
      hours: dateTS.getHours(),
      minutes: dateTS.getMinutes(),
    };

    socket.emit("SEND_ROOM_MESSAGE", currentMessage);

    setStateMessage([...stateMessage, currentMessage]);
  }

  const GenMessages = () => {
    const genDate = (date: Message): string => {
      return `${date.hours}:${date.minutes}`;
    };

    // if (currentMessage?.message === "") return <div id="liena"></div>;
    return (
      <>
        {stateMessage?.map((stateMessage, index) => {
          return (
            <div key={index + 1} className="chat-wrapper">
              <div className="chat">
                <span>{stateMessage.username}</span>
                <span>{stateMessage.message}</span>
              </div>
              <span className="date">{genDate(stateMessage)}</span>
            </div>
          );
        })}
      </>
    );
  };

  const GenSendMessage = () => {
    return (
      <InputButton
        onSubmit={handleSubmit}
        inputProps={{
          placeholder: "Tell us what you are thinking",
          name: "messageInput",
        }}
        buttonText="SEND"
      />
    );
  };

  return (
    // <div id="scroll">
    <div id="content">
      <div id="chatContainer">
        <GenMessages />
      </div>
      <GenSendMessage />
    </div>
    // </div>
  );
}

export default MessagesContainer;
