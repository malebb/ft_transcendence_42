import { useState } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
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

interface message {
  username: string;
  message: string;
  sendAt: Date;
  room: boolean;
  roomId: string;
}

function MessagesContainer() {
  let newMessage: message = {
    username: "username",
    message: "",
    sendAt: new Date(),
    room: false,
    roomId: "",
  };

  const [stateMessage, setStateMessage] = useState<message[]>([
    {
      ...newMessage,
    },
  ]);

  let currentMessage: message = { ...newMessage };

  const { socket } = useSockets();

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
    };

    setStateMessage([...stateMessage, currentMessage]);

    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, currentMessage);

    // currentMessage = [];

    // recevoir des messages venant d'un utilisateur de la room ??
    socket.on(EVENTS.SERVER.ROOM_MESSAGE, (data) => {
      console.log({ data });
      // console.log("Received message : ", {});
    });
  }

  const GenMessages = () => {
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
              <span className="date">{`${String(
                stateMessage.sendAt.getHours()
              ).padStart(2, "0")}:${String(
                stateMessage.sendAt.getMinutes()
              ).padStart(2, "0")}`}</span>
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
