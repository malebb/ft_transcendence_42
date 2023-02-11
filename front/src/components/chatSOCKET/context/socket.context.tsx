import io, { Socket } from 'socket.io-client';
// import { SOCKET_URL } from '../config/default';
import { createContext, useContext, useEffect, useState } from 'react';
import EVENTS from '../config/events';

interface Context {
	socket: Socket;
	username?: string
	setUsername: Function;
	messages?: {message: string; time: string; username: string}[];
	setMessages: Function;
	roomId?: string;
	// rooms: object;
	rooms: Record<string,{name: string}>,
	setRoomId: Function,
}

const socket = io("*");

const SocketContext = createContext<Context>({
	socket,
	setUsername: (username: string) => {
		console.log({username});
	},
	setMessages: (messages: {message: string; time: string; username: string}[]) => {
		console.log({messages});
	},
	rooms: {},
	setRoomId: (roomId: string) => {
		console.log({roomId});
	},
	messages: [],
});

function SocketsProvider(props: any) {

	//
	const [username, setUsername] = useState("");
	const [roomId, setRoomId] = useState("");
	const [rooms, setRooms] = useState({});
	const [messages, setMessages] = useState([{}]);

	socket.on(EVENTS.SERVER.ROOMS, (value) => {
		setRooms(value);
	});

	socket.on(EVENTS.SERVER.JOINED_ROOM, (value) => {
		setRoomId(value);
		console.log({value});
		setMessages([]);
	});

	useEffect(() => {
		socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, username, time }) => {
			if (!document.hasFocus()) {
				document.title = "New message...";
			}
			console.log(42, {messages});
			setMessages((messages) => [...messages, { message, username, time }]);

		});
	}, [socket]);

	return (
	    <SocketContext.Provider value={{
	        socket,
			username,
			setUsername,
			rooms,
			roomId,
			setRoomId,
			messages,
			setMessages,
		}}
		{...props}
	/>
  );
}

// // check useContext
export const useSockets = () => useContext(SocketContext);

export default SocketsProvider;