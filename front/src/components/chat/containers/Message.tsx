import { useEffect, useRef, useState } from "react";
import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import InputButton from "../inputs/InputButton";
import { AxiosInstance } from "axios";

import "./message.style.css";
import { type } from "os";
import { axiosToken } from "src/api/axios";

// interface partialMessage {
//   username: string;
//   message: string;
//   time: number;
// }

// interface messageTmp extends partialMessage {
//   roomId: string;
// }

type mesageType = "current" | "other";

interface Message {
  username: string;
  userId: number;
  message: string;
  sendAt: Date;
  hours: string;
  minutes: string;
  room: boolean;
  roomId: string;
}

function MessagesContainer() {
  let newMessage: Message = {
    username: "username",
    userId: 0,
    message: "",
    sendAt: new Date(),
    hours: "00",
    minutes: "00",
    room: false,
    roomId: "",
  };

  // declaration d'une variable d'etat
  // useState = hook d'etat (pour une variable)
  const [stateMessage, setStateMessage] = useState<Message[]>([]);
  const axiosInstance = useRef<AxiosInstance | null>(null);

  let currentMessage: Message = { ...newMessage };

  const socket = SocketContext();
  const userIdValue: string = sessionStorage.getItem("id") || "0";
  const userId: number = parseInt(userIdValue);

  useEffect(() => {
    const getCurrentUser = async () => {
      axiosInstance.current = await axiosToken();
	  const tmp = await axiosInstance.current?.get("/users/me");
    console.log(tmp);
	};
	console.log(currentMessage.username);
    getCurrentUser();
    socket.on("ROOM_MESSAGE", (message) => {
      console.log({ message });
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
      userId: userId,
      sendAt: dateTS,
      hours: String(dateTS.getHours()).padStart(2, "0"),
      minutes: String(dateTS.getMinutes()).padStart(2, "0"),
    };

    socket.emit("SEND_ROOM_MESSAGE", currentMessage);

    setStateMessage([...stateMessage, currentMessage]);
  }

  const GenMessages = () => {
    const genDate = (date: Message): string => {
      return `${date.hours}:${date.minutes}`;
    };

    const genMessage = (isCurrentUser: boolean, currentMessage: Message) => {
      if (!isCurrentUser) {
        return (
          <>
            <div className="chat">
              <span>{currentMessage.username}</span>
              <span>{currentMessage.message}</span>
            </div>
            <span className="date">{genDate(currentMessage)}</span>
          </>
        );
      }
      return (
        <>
          <span className="date">{genDate(currentMessage)}</span>
          <div className="chat-sender">
            <span>{currentMessage.username}</span>
            <span>{currentMessage.message}</span>
          </div>
        </>
      );
    };

    // if (currentMessage?.message === "") return <div id="liena"></div>;
    return (
      <>
        {stateMessage?.map((stateMessage, index) => {
          const isCurrentUser = userId == stateMessage.userId;

          return (
            <div key={index + 1} className="chat-wrapper">
              {genMessage(isCurrentUser, stateMessage)}
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
    <div id="content">
      <div id="chatContainer">
        <GenMessages />
      </div>
      <GenSendMessage />
    </div>
  );
}

export default MessagesContainer;
