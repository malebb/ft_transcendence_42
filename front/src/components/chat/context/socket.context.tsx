import io, { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import EVENTS from "../config/events";

/**
//* INFO

Dans ce fichier, on a tous les envois de socket vers le back.
On appel ce fichier dans les pages room, message...
en utilisant :
  import { useSockets } from "../context/socket.context";
  const { socket } = useSockets();

**/

interface Context {
  socket: Socket;
  username?: string;
  setUsername: Function;
  messages?: { message: string; time: string; username: string }[];
  setMessages: Function;
  roomId?: string;
  // rooms: object;
  rooms: Record<string, { name: string }>;
  setRoomId: Function;
}

const socket = io("http://localhost:4444");

const SocketContext = createContext<Context>({
  socket,
  setUsername: (username: string) => {
    console.log({ username });
  },
  setMessages: (
    messages: { message: string; time: string; username: string }[]
  ) => {
    // console.log({messages});
  },
  rooms: {},
  setRoomId: (roomId: string) => {
    // console.log({roomId});
  },
  messages: [],
});

function SocketsProvider(props: any) {
  // from here, all socket used in front
//   useEffect(() => {

	// socket.on(EVENTS.CLIENT.CONNECT, () => {
	// 	// connection to socket
	// 	console.log("Connected to socket - front side")
	// });

//   });

  //   const [username, setUsername] = useState("");
  //   const [roomId, setRoomId] = useState("");
  //   const [rooms, setRooms] = useState({});
  //   const [messages, setMessages] = useState([{}]);

  //   socket.on(EVENTS.SERVER.ROOMS, (value) => {
  //     setRooms(value);
  //   });

  //   socket.on(EVENTS.SERVER.JOINED_ROOM, (value) => {
  //     setRoomId(value);
  //     console.log({ value });
  //     setMessages([]);
  //   });

  //   useEffect(() => {
  //     socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, username, time }) => {
  //       if (!document.hasFocus()) {
  //         document.title = "New message...";
  //       }
  //       console.log(42, { messages });
  //       setMessages((messages) => [...messages, { message, username, time }]);
  //     });
  //   }, [socket]);

  //   return (
  //     <SocketContext.Provider
  //       value={{
  //         socket,
  //         username,
  //         setUsername,
  //         rooms,
  //         roomId,
  //         setRoomId,
  //         messages,
  //         setMessages,
  //       }}
  //       {...props}
  //     />
  //   );
}

export const useSockets = () => useContext(SocketContext);

export default SocketsProvider;
