import { useEffect, useRef, useState } from "react";
import { axiosToken } from "src/api/axios";
import { Socket, io } from "socket.io-client";
import { Message, User } from "ft_transcendence";
import { AxiosInstance } from "axios";
import { useParams } from "react-router-dom";

import style from "../../../styles/private.message.module.css";
import "./message.style.css";
import InputButton from "../inputs/InputButton";

function PrivateMessages() {
  const [stateMessages, setStateMessages] = useState<Message[]>([]);
  const currentUser = useRef<User | null>(null);
  const friend = useRef<User | null>(null);
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const socket = useRef<Socket | null>(null);
  const friendId = useParams();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  let newMessage: Message;

  function closeMessage(): void {
    document.getElementById("myForm")!.style.display = "none";
  }

  const scrollToBottom = () => {
    document.getElementById("chatContainer")?.scrollTo({
      top: document.getElementById("chatContainer")?.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      axiosInstance.current = await axiosToken();
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current = response.data;
      });
      axiosInstance.current = await axiosToken();
      await axiosInstance
        .current!.get("/users/profile/" + friendId.userId)
        .then((response) => {
          friend.current = response.data;
        });
    };
    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [stateMessages]);

  useEffect(() => {
    socket.current = io("ws://localhost:3333/chat", {
      transports: ["websocket"],
      forceNew: true,
      upgrade: false,
    });
    socket.current!.on("connect", async () => {
      socket.current!.on("PRIVATE", function (message) {
        setStateMessages((stateMessages) => [...stateMessages, message]);
      });
      return () => {
        socket.current?.disconnect();
      };
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    // https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
    // Prevent the browser from reloading the page
    event.preventDefault();

    // Read the form data
    // @ts-ignore
    const form = new FormData(event.target);
    const inputMessage = form.get("messageInput")?.toString()?.trim();

    if (!inputMessage?.length) return;

    // debugger;

    // ! a la fin = signifie que la variable et non nulle et non non-definie
    const dateTS = new Date();
    newMessage = {
      user: currentUser.current!,
      message: inputMessage,
      sendAt: dateTS,
    };

    socket.current!.emit("PRIVATE", { msg: newMessage, friend: friend });
    setStateMessages([...stateMessages, newMessage]);
  }

  const GenMessages = () => {
    const genDate = (date: Message): string => {
      const newDate = new Date(date.sendAt);
      return `${("0" + newDate.getHours()).slice(-2)}:${(
        "0" + newDate.getMinutes()
      ).slice(-2)}`;
    };

    const genMessage = (isCurrentUser: boolean, newMessage: Message) => {
      if (!isCurrentUser) {
        return (
          <>
            <div className="chat-receiver">
              <span>{newMessage?.user?.username + " : "}</span>
              <span>{newMessage.message}</span>
            </div>
            <span className="date">{genDate(newMessage)}</span>
          </>
        );
      }
      return (
        <div className="chat-sender">
          <span className="date">{genDate(newMessage)}</span>
          <div className="chat-username">
            <span>{newMessage?.user?.username + " : "}</span>
            <span>{newMessage.message}</span>
          </div>
        </div>
      );
    };

    return (
      <>
        {stateMessages?.map((message, index) => {
          const isCurrentUser =
            currentUser.current!.username === message?.user?.username;

          return (
            <div key={index + 1} className="chat-wrapper">
              {genMessage(isCurrentUser, message)}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div>
      <div className={style.chatpopup} id="myForm">
        <div
          className={style.formcontainer}
          id="chatContainer"
          ref={messagesContainerRef}
        >
          <GenMessages />
        </div>
        <InputButton
          onSubmit={handleSubmit}
          inputProps={{
            placeholder: "Tell us what you are thinking",
            name: "messageInput",
          }}
          buttonText="SEND"
        />
        <button
          type="button"
          className={style.close}
          onClick={closeMessage}
        ></button>
      </div>
    </div>
  );
}

export default PrivateMessages;
