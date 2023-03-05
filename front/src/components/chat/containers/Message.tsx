import { useEffect, useRef, useState } from "react";
import { SocketContext } from "../context/socket.context";
import InputButton from "../inputs/InputButton";
import { AxiosInstance } from "axios";
import { axiosToken } from "src/api/axios";
import Sidebar from "src/components/Sidebar";
import Headers from "src/components/Headers";
import { useParams } from "react-router-dom";
import { ChatRoom } from "ft_transcendence";
import { User } from "ft_transcendence";
import { Message } from "ft_transcendence";

import "./message.style.css";
import style from "../ChatRoom.module.css"

function MessagesContainer() {

  // declaration d'une variable d'etat
  // useState = hook d'etat (pour une variable)
  const [stateMessage, setStateMessage] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [currentRoom, setCurrentRoom] = useState<ChatRoom>();
  const axiosInstance = useRef<AxiosInstance|null>(null);
  const { roomId } = useParams();
  const socket = SocketContext();
  let newMessage: Message;

  // reference a l'element DOM contenant les messages (js)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
// fait defiler la page vers le bas : utilise scrollview
// pour defiler jusqu'a la fin de la div
messagesContainerRef.current?.scrollIntoView({ behavior: "smooth"});
};

// https://devtrium.com/posts/async-functions-useeffect
  useEffect(() => {

	// declare the async data fetching function
	const fetchData = async () => {
	  // get the data from the api
	  axiosInstance.current = await axiosToken();
	  await axiosInstance.current!.get("/users/me").then((response) => {
		setCurrentUser(response.data);
	  });
	  axiosInstance.current = await axiosToken();
	  await axiosInstance.current!.get("/chatRoom/" + roomId).then((response) => {
		setCurrentRoom(response.data)
	  });
	  // set state with the result
	}
	// call the function
	fetchData()
	  // make sure to catch any error
	  .catch(console.error);;

	  socket.on("ROOM_MESSAGE", (message) => {
	// pourquoi (stateMessage) avant ?
	// les ... peuvent entraîner des problèmes de concurrence
	// car l'état précédent est conservé dans la closure
	// de la fonction de mise à jour (useEffect)
	// Prend donc l'etat precedent, au lieu du tableau
	// et retourne le nouveau
		setStateMessage((stateMessage) => [...stateMessage, message]);
	  });

	}, []);

useEffect(() => {
	scrollToBottom();
  }, [stateMessage]);


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
		user: currentUser!,
		room: currentRoom!,
		message: inputMessage,
		sendAt: dateTS,
	}

    socket.emit("SEND_ROOM_MESSAGE", newMessage);

// besoin du (stateMessage) avant ? NON
    setStateMessage([...stateMessage, newMessage]);
  }

  const GenMessages = () => {

    const genDate = (date: Message): string => {
		const newDate = new Date(date.sendAt)
      return `${('0'+newDate.getHours()).slice(-2)}:${('0'+newDate.getMinutes()).slice(-2)}`;
    };

    const genMessage = (isCurrentUser: boolean, newMessage: Message) => {
      if (!isCurrentUser) {
        return (
          <>
            <div className="chat-receiver">
              <span>{newMessage.user.username + " : "}</span>
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
            <span>{newMessage.user.username + " : "}</span>
            <span>{newMessage.message}</span>
          </div>
        </div>
      );
    };

    return (
      <>
        {stateMessage?.map((stateMessage, index) => {
           const isCurrentUser = currentUser?.username == stateMessage.user.username;

          return (
            <div key={index + 1} className="chat-wrapper"ref={messagesContainerRef}>
              {genMessage(isCurrentUser, stateMessage)}
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
  
  const GenTitle = () => {
	return (
		<div className={style.title}>
			<h1 className={style.logo}>{roomId}</h1>
			<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
			  <path fill="#413368" d="M37.7,-48.2C52.8,-41,71.7,-35.2,78.9,-23.2C86.1,-11.3,81.6,6.9,71.8,19.2C62.1,31.4,47.1,37.8,34.2,45.1C21.4,52.4,10.7,60.7,-0.1,60.9C-11,61,-21.9,53.1,-36.1,46.2C-50.2,39.3,-67.6,33.5,-75.2,21.7C-82.8,9.9,-80.7,-7.8,-73.8,-22.3C-66.8,-36.8,-54.9,-48,-41.8,-55.8C-28.7,-63.7,-14.3,-68.2,-1.5,-66.1C11.3,-64,22.6,-55.4,37.7,-48.2Z" transform="translate(100 100)" />
			</svg>
		</div>
	)
}

  return (
	<div className="chatPage">
	<div className="headerAndSidebar">
	  <Headers />
	  <Sidebar />
	  </div>
    <div id="content">
	  <GenTitle />
      <div id="chatContainer">
        <GenMessages />
      </div>
      <GenInputButton />
    </div>
	</div>
  );
}

export default MessagesContainer;
