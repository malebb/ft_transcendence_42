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

interface messageTmp extends partialMessage {
  roomId: string;
}

interface message {
  username: string;
  message: string;
  sendAt: Date;
  room: boolean;
  roomId: string;
}

function MessagesContainer() {

  const [stateMessage, setStateMessage] = useState<message | null>(null);

  let newMessage: message = {
    username: "username",
    message: "",
    sendAt: new Date(),
    room: false,
    roomId: "noRoom",
  };

  let currentMessage: message = { ...newMessage };
  
  const { socket, roomId, username } = useSockets();
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
	  // https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
	  // Prevent the browser from reloading the page
	  event.preventDefault();
	  
	  // Read the form data
    // @ts-ignore
    const form = new FormData(event.target);
    const inputMessage = form.get("messageInput")?.toString()?.trim();

    if (!inputMessage?.length) return;
	
    // debugger;;

    // console.log({roomId, inputMessage, username});
    // emit un message vers le back

    // debugger;
	
    const dateTS = new Date();
    currentMessage = {
		...newMessage,
		message: inputMessage,
		sendAt: dateTS,
    };
	
	setStateMessage(currentMessage);

    console.log({ currentMessage });

    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, currentMessage);

    // currentMessage = [];

    // recevoir des messages venant d'un utilisateur de la room ??
    // marche pas loool
    socket.on(EVENTS.SERVER.ROOM_MESSAGE, () => {
      // console.log({ data });
      // console.log("Received message : ", {});
    });
  }

  const GenMessages = () => {
    if (stateMessage?.message === "") return <div id="liena"></div>;
    return (
      <div className="chat-wrapper">
        <div id="rayane" className="chat">
          <span>{currentMessage.username}</span>
          <span>{stateMessage?.message}</span>
        </div>
        <span className="date">{`${currentMessage.sendAt.getHours()}:${currentMessage.sendAt.getMinutes()}`}</span>
      </div>
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
