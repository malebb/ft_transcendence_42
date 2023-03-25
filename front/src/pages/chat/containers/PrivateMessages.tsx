import { useEffect, useRef, useState } from "react";
import { axiosToken } from "src/api/axios";
import { Socket, io } from "socket.io-client";
import { Message, User } from "ft_transcendence";
import { AxiosInstance } from "axios";
import { useParams } from "react-router-dom";

import style from "../../../styles/private.message.module.css";
import "./message.style.css";

export interface PrivateMessage {
  sender: User;
  receiver: User;
  message: Message;
}

function PrivateMessages() {
  const [stateMessages, setStateMessages] = useState<Message[]>([]);
  const currentUser = useRef<User | null>(null);
  const friend = useRef<User | null>(null);
  const room = useRef<object | null>(null);
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const socket = useRef<Socket | null>(null);
  const friendId = useParams();
  const [inputMessage, setInputMessage] = useState('');
  let newMessage: Message;
  const [initSocket, setInitSocket] = useState<boolean>(false);

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
    scrollToBottom();
  }, [stateMessages]);

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

    const initPrivateChat = async () => {
      await fetchData().catch(console.error);
      socket.current = io("ws://localhost:3333/chat", {
        transports: ["websocket"],
        forceNew: true,
        upgrade: false,
      });
      socket.current!.on("connect", async () => {
        socket.current?.emit("JOIN_PRIVATE_ROOM", {
          sender: currentUser.current,
          receiver: friend.current,
        });
        const joinRoom = async (): Promise<object> => {
          return await new Promise(function (resolve) {
            socket.current!.on("GET_ROOM", async (data) => {
              resolve(data);
            });
          });
        };
        joinRoom().then(function (data) {
          room.current = data;
          setInitSocket(true);
        });
        socket.current!.on("RECEIVE_PRIVATE_ROOM_MESSAGE", function (message) {
          setStateMessages((stateMessages) => [...stateMessages, message]);
        });
      });
      return () => {
        socket.current?.disconnect();
      };
    };
    initPrivateChat().catch(console.error);
  }, []);

  function handleSubmit(event: any):void { //React.FormEvent<HTMLFormElement>): void {
    // https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
    // Prevent the browser from reloading the page
    event.preventDefault();

    if (!inputMessage?.length) return;

    // ! a la fin = signifie que la variable et non nulle et non non-definie
    const dateTS = new Date();
    newMessage = {
      user: currentUser.current!,
      message: inputMessage,
      sendAt: dateTS,
    };

    socket.current!.emit("SEND_PRIVATE_ROOM_MESSAGE", {
      msg: newMessage,
      room: room.current,
      sender: currentUser.current,
      receiver: friend.current,
    });
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

  const DisplayMessages = () => {
    if (initSocket === true) return <GenMessages />;
    return (<></>)
  };

  return (
    <div>
      <div className={style.chatpopup} id="myForm">
        <div
          className={style.formcontainer}
          id="chatContainer"
        >
          <DisplayMessages />
        </div>
        <form id="myForm" onSubmit={handleSubmit} className={style.sendInput}>
          <input
            name="messageInput"
            placeholder="Write here..."
            autoComplete="off"
            onChange={(event) => setInputMessage(event.target.value)}
          />
          <button type="submit">SEND</button>
        </form>
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

/*
notes: 
  Read the form data
  https://stackoverflow.com/questions/36683770/how-to-get-the-value-of-an-input-field-using-reactjs
  const form = new FormData(event.target);
  const form = (document.getElementsByTagName("messageInput")[1] as HTMLInputElement).value;

*/