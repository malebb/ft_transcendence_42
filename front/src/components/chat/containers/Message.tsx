import { useRef, useEffect, useState, MutableRefObject } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import InputButton from "../../utils/inputs/InputButton";

import "./message.style.css";

interface partialMessage {
  username: string;
  message: string;
  time: number;
}

interface message extends partialMessage {
  roomId: number;
}

function MessagesContainer() {
  const [messages, setMessages] = useState<message[]>([]);

  let messageTmp: message = {
    username: "b",
    message: "",
    time: +new Date(),
    roomId: 0,
  };

  const { socket, roomId, username } = useSockets();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
    // Prevent the browser from reloading the page
    event.preventDefault();

    // Read the form data
    // @ts-ignore
    const form = new FormData(event.target);
    const currentMessage = form.get("messageInput")?.toString()?.trim();

    if (!currentMessage?.length) return;

    // debugger;;

    // console.log({roomId, currentMessage, username});
    // emit un message vers le back

    // debugger;

    const dateTS = +new Date();
    setMessages([
      ...messages,
      {
        username: "b",
        message: currentMessage,
        time: dateTS,
        roomId: 0,
      },
    ]);

    messageTmp.message = currentMessage;
    messageTmp.username = "Rayane";
    messageTmp.roomId = 42;
    messageTmp.time = dateTS;

    console.log({ messageTmp });

    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, messageTmp);

    // messages = [];

    // recevoir des messages venant d'un utilisateur de la room ??
    // marche pas loool
    socket.on(EVENTS.SERVER.ROOM_MESSAGE, () => {
      // console.log({ data });
      // console.log("Received message : ", {});
    });
  }

  const genMessages = () => {
    if (!messages?.length) return;
    return messages.map(({ message, username, time }, index) => {
      const date = new Date(time);
      return (
        <div key={index} className="chat-wrapper">
          <div className="chat">
            <span>{username}</span>
            <span>{message}</span>
          </div>
          <span className="date">{`${date.getHours()}:${date.getMinutes()}`}</span>
        </div>
      );
    });
  };

  const genSendMessage = () => {
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
      <div id="chatContainer">{genMessages()}</div>
      {genSendMessage()}
    </div>
    // </div>
  );
}

export default MessagesContainer;
