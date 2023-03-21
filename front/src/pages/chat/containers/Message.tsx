import { useEffect, useRef, useState } from "react";
import InputButton from "../inputs/InputButton";
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken, getToken } from "src/api/axios";
import { useParams, Link } from "react-router-dom";
import { ChatRoom } from "ft_transcendence";
import { User } from "ft_transcendence";
import { Message } from "ft_transcendence";
import { formatRemainTime } from '../utils/Penalty';

import "./message.style.css";
import { Socket, io } from "socket.io-client";

type MessagesProps = 
{
	updateRoomStatus: () => void;
}

function MessagesContainer({updateRoomStatus}: MessagesProps) { 
  // declaration d'une variable d'etat
  // useState = hook d'etat (pour une variable)
  const [stateMessages, setStateMessages] = useState<Message[]>([]);
  const currentUser = useRef<User | null>(null);
  const currentRoom = useRef<ChatRoom | null>(null);
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const roomId = useParams();
  // const socket = SocketContext();
  const socket = useRef<Socket | null>(null);
  let newMessage: Message;
  let [muteTimeLeft, setMuteTimeLeft] = useState<string>('');

  // reference a l'element DOM contenant les messages (js)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // fait defiler la page vers le bas : utilise scrollview
    // pour defiler jusqu'a la fin de la div
    document.getElementById("chatContainer")?.scrollTo({
      top: document.getElementById("chatContainer")?.scrollHeight,
      behavior: "smooth",
    });
  };

  // https://devtrium.com/posts/async-functions-useeffect
  useEffect(() => {
    // declare the async data fetching function
    const fetchData = async () => {
      // get the data from the api
      axiosInstance.current = await axiosToken();
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current = response.data;
      });
      axiosInstance.current = await axiosToken();
      await axiosInstance
        .current!.get("/chatRoom/publicInfos/" + roomId.roomName)
        .then((response) => {
          currentRoom.current = response.data;
          socket.current?.emit("JOIN_ROOM", currentRoom.current);
        });
      axiosInstance.current = await axiosToken();
      await axiosInstance
        .current!.get("/message/" + currentRoom.current?.name)
        .then((response) => {
          setStateMessages(response.data);
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
	  auth: {
			token: getToken().access_token
	  }
    });
    socket.current.on("connect", async () => {
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current = response.data;
      });
      socket.current!.on("ROOM_MESSAGE", (message: Message) => {
        setStateMessages((stateMessages) => [...stateMessages, message]);
		if (message.user.id === currentUser.current!.id)
	  		setMuteTimeLeft('');
		updateRoomStatus();
      });
      socket.current!.on("MUTE", (mute) => {
	  	setMuteTimeLeft('You are muted (' + formatRemainTime(mute.penalties) + ')');
		updateRoomStatus();
      });

      return () => {
        socket.current?.disconnect();
      };
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
    // Prevent the browser from reloading the page
    event.preventDefault();

	updateRoomStatus();

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
      room: currentRoom.current!,
      message: inputMessage,
      sendAt: dateTS,
    };

   	socket.current!.emit("SEND_ROOM_MESSAGE", newMessage);
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
              <span><Link className="msgProfileLink" to={`/user/${newMessage.user.id}`}>{newMessage?.user?.username}</Link> : </span>
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
            <span><Link className="msgProfileLink" to={`/user/${newMessage.user.id}`}>{newMessage?.user?.username }</Link> : </span>
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

  const GenInputButton = () => {
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
    <>
      <div className="chatPage">
        <div id="content">
          <div id="chatContainer" ref={messagesContainerRef}>
            <GenMessages />
          </div>
		  <p className="muteMsg">{muteTimeLeft}</p>
          <GenInputButton />
        </div>
      </div>
    </>
  );
}

export default MessagesContainer;


/*

  setStateMessages((stateMessages) => [...stateMessages, message]);
  ->
  pourquoi (stateMessages) avant ?
  les ... peuvent entraîner des problèmes de concurrence
  car l'état précédent est conservé dans la closure
  de la fonction de mise à jour (useEffect)
  Prend donc l'etat precedent, au lieu du tableau et retourne le nouveau


*/
