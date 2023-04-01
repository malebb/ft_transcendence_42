import { useContext, useEffect, useRef, useState } from "react";
import { AxiosInstance, AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { ChatRoom } from "ft_transcendence";
import { Socket, io } from "socket.io-client";
import { User, Message, MessageType } from "ft_transcendence";
import { formatRemainTime } from "../utils/Penalty";

import "./message.style.css";
import style from "../inputs/InputButton.module.css"
import useAxiosPrivate from "src/hooks/usePrivate";
import AuthContext from "src/context/TokenContext";
function MessagesContainer() { 
  const axiosPrivate = useAxiosPrivate();
  const {token} = useContext(AuthContext);
  const [stateMessages, setStateMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const currentUser = useRef<User | null>(null);
  const currentRoom = useRef<ChatRoom | null>(null);
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const roomId = useParams();
  const socket = useRef<Socket | null>(null);
  let newMessage: Message;
  let [muteTimeLeft, setMuteTimeLeft] = useState<string>("");

  const scrollToBottom = () => {
    document.getElementById("chatContainer")?.scrollTo({
      top: document.getElementById("chatContainer")?.scrollHeight,
      behavior: "smooth",
    });
  };

  function adjustTextareaHeight() {
    const tx = document.getElementsByTagName("textarea");
    function onInput(this: HTMLTextAreaElement) {
      this.style.height = "0px";
      this.style.height = this.scrollHeight + "px";
    }
    for (let i = 0; i < tx.length; i++) {
      if (tx[i].value === "") {
        tx[i].setAttribute("style", "height:" + 20 + "px;overflow-y:hidden;");
      } else {
        tx[i].setAttribute(
          "style",
          "height:" + tx[i].scrollHeight + "px;overflow-y:hidden;"
        );
      }
      tx[i].addEventListener("input", onInput, false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // get the data from the api
      axiosInstance.current = axiosPrivate;
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current = response.data;
      }).catch(console.error);
      axiosInstance.current = axiosPrivate;
      await axiosInstance
        .current!.get("/chatRoom/publicInfos/" + roomId.roomName)
        .then((response) => {
          currentRoom.current = response.data;
          socket.current?.emit("JOIN_ROOM", currentRoom.current);
        }).catch(console.error);
      axiosInstance.current = axiosPrivate;
      await axiosInstance
        .current!.get("/message/" + currentRoom.current?.name)
        .then((response) => {
          setStateMessages(response.data);
          scrollToBottom();
        }).catch(console.error);
    };
    fetchData().catch(console.error);
  }, [roomId, axiosPrivate]);

  useEffect(() => {
    socket.current = io("ws://localhost:3333/chat", {
      transports: ["websocket"],
      forceNew: true,
      upgrade: false,
	  auth: {
			token: token!.access_token,
	  }
    });

    socket.current.on("connect", async () => {
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current = response.data;
      }).catch(console.error);
      socket.current!.on("ROOM_MESSAGE", async (message: Message) => {
		try
		{
        	const blocked: AxiosResponse = await axiosInstance.current!.get(
          "/users/blocked/" + message.user.id
        	);
        	if (!blocked.data.length) {
   	    	   	setStateMessages((stateMessages) => [...stateMessages, message]);
   	    		if (message.user.id === currentUser.current!.id) setMuteTimeLeft("");
	    	}
		}
		catch (error: any)
		{
			console.log('error: ', error)
		}
      });
      socket.current!.on("MUTE", async (mute) => {
        setMuteTimeLeft(
          "You are muted (" + formatRemainTime(mute.penalties) + ")"
        );
      });

      return () => {
        socket.current?.disconnect();
      };
    });
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setInputMessage("");

    if (!inputMessage?.length) return;

    const dateTS = new Date();
    newMessage = {
      user: currentUser.current!,
      room: currentRoom.current!,
      message: inputMessage,
      sendAt: dateTS,
      type: MessageType["STANDARD" as keyof typeof MessageType],
      challengeId: 0,
    };
    socket.current!.emit("SEND_ROOM_MESSAGE", newMessage);
    setInputMessage("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }

  useEffect(() => {
    adjustTextareaHeight();
    scrollToBottom();
  }, [stateMessages]);

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
            <div className="chat-container-receiver">
              <div className="chat-text-container-receiver">
                <a className="a" href={"/user/" + newMessage.user.id}>
                  {newMessage?.user?.username}
                </a>
                <div className="dot">{":"}</div>
                <p className="chat-text">{newMessage.message}</p>
              </div>
              <span className="date">{genDate(newMessage)}</span>
            </div>
          </>
        );
      }
      return (
        <>
          <div className="chat-container-sender">
            <span className="date">{genDate(newMessage)}</span>
            <div className="chat-text-container-sender">
              <span className="chatUsername">{newMessage?.user?.username}</span>
              <div className="dot">{":"}</div>
              <p className="chat-text">{newMessage.message}</p>
            </div>
          </div>
        </>
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
    <>
      <div className="chatPage">
        <div id="content" className="chatRoomContent">
          <div id="chatContainer">
            <GenMessages />
          </div>
          <p className="muteMsg">{muteTimeLeft}</p>
          <form id="myForm" onSubmit={handleSubmit} className={style.sendInput}>
            <textarea
              name="messageInput"
              placeholder="Tell us what you are thinking"
              autoComplete="off"
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              className={style.textarea}
            ></textarea>
            <button type="submit">SEND</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default MessagesContainer;

/*

  ! a la fin = signifie que la variable et non nulle et non non-definie

  https://beta.reactjs.org/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form
  Prevent the browser from reloading the page
  event.preventDefault();

  setStateMessages((stateMessages) => [...stateMessages, message]);
  ->
  pourquoi (stateMessages) avant ?
  les ... peuvent entraîner des problèmes de concurrence
  car l'état précédent est conservé dans la closure
  de la fonction de mise à jour (useEffect)
  Prend donc l'etat precedent, au lieu du tableau et retourne le nouveau

  prop key:
  https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js/43892905#43892905

  useState render first time :
  https://stackoverflow.com/questions/54069253/the-usestate-set-method-is-not-reflecting-a-change-immediately


  shrink input text message
  https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize

  lien interessant pour les event input
  https://devtrium.com/posts/react-typescript-events

  async function :
	https://devtrium.com/posts/async-functions-useeffect

*/
