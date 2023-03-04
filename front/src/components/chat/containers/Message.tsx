import { useEffect, useRef, useState } from "react";
import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import InputButton from "../inputs/InputButton";
import { AxiosInstance, AxiosResponse } from "axios";

import "./message.style.css";
import style from "../ChatRoom.module.css"


import { type } from "os";
import { axiosToken } from "src/api/axios";
import Sidebar from "src/components/Sidebar";
import Headers from "src/components/Headers";
import { useParams } from "react-router-dom";

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
  const [user, setUser] = useState("");
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const { roomId } = useParams();

  let currentMessage: Message = { ...newMessage };

  const socket = SocketContext();
  const userIdValue: string = sessionStorage.getItem("id") || "0";
  const userId: number = parseInt(userIdValue);

  useEffect(() => {
    const getCurrentUser = async () => {
      axiosInstance.current = await axiosToken();
      await axiosInstance.current!.get("/users/me").then((response) => {
        setUser(response.data.username);
      });
    };
    getCurrentUser();
    console.log(currentMessage.username);
    socket.on("ROOM_MESSAGE", (message) => {
      setStateMessage([...stateMessage, message]);
    });
  });

  //   const getCurrentUser = async () => {
  // 	axiosInstance.current = await axiosToken();
  // 	await axiosInstance.current!.get("/users/me").then((response) => {
  // 	  setUser(response.data);
  // 	});
  //   };
  //   getCurrentUser();

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
      username: user,
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
        <div className="chat-sender">
          <span className="date">{genDate(currentMessage)}</span>
          <div className="chat-username">
            <span>{currentMessage.username}</span>
            <span>{currentMessage.message}</span>
          </div>
        </div>
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
  
  const GenTitle = () => {
	return (
		<div className="headerRoomName">
		<div className={style.title}>
			<h1 className={style.logo}>{roomId}</h1>
			<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
			  <path fill="#413368" d="M37.7,-48.2C52.8,-41,71.7,-35.2,78.9,-23.2C86.1,-11.3,81.6,6.9,71.8,19.2C62.1,31.4,47.1,37.8,34.2,45.1C21.4,52.4,10.7,60.7,-0.1,60.9C-11,61,-21.9,53.1,-36.1,46.2C-50.2,39.3,-67.6,33.5,-75.2,21.7C-82.8,9.9,-80.7,-7.8,-73.8,-22.3C-66.8,-36.8,-54.9,-48,-41.8,-55.8C-28.7,-63.7,-14.3,-68.2,-1.5,-66.1C11.3,-64,22.6,-55.4,37.7,-48.2Z" transform="translate(100 100)" />
			</svg>
		</div>
		</div>
	)
}


  return (
	<div>
	<div>
	  <Headers />
	  </div>
    <div id="content">
	  <Sidebar />
      <div id="chatContainer">
	  <GenTitle />
        <GenMessages />
      <GenSendMessage />
      </div>
    </div>
	</div>
  );
}

export default MessagesContainer;
