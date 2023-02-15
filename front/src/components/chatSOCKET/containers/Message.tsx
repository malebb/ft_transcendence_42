import { useRef, useEffect, useState } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";

import "./message.style.css"

interface partialMessage {
	username: string;
	message: string;
	time: number;
}

interface message extends partialMessage {
	roomId: number;
}

function MessagesContainer() {
	const [messages, setMessages] = useState<message[]>([]);

	const { socket, roomId, username } = useSockets();
	// const [ newMessageRef, setNewMessageRef ] = useState<any>(null);
	const newMessageRef = useRef<any>(null);


	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		
		event.preventDefault();

		// @ts-ignore
		const form = new FormData(event.target);
		const currentMessage = form.get("userMessage")?.toString()?.trim();

		if (!currentMessage?.length) {
			return;
		}

		
		// debugger;;


		// emit un message vers le back
		socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, { roomId, currentMessage, username });

		// debugger;

		const dateTS = +new Date();
		setMessages([
			...messages,
			{
				username: "b",
				message: currentMessage,
				time: dateTS,
				roomId: 0
			}
		])
		
		// recevoir des messages venant d'un utilisateur de la room
		socket.on(EVENTS.SERVER.ROOM_MESSAGE, () => {
			// console.log({ data });
			// console.log("Received message : ", {});
		});

		newMessageRef.current.value = "";
	}


	// useEffect(() => {
	// 	messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	//   }, [messages]);

	// if (!roomId) {
	// 	return <div />;
	// }

	const genMessages = () => {
		if (!messages?.length) return;
		return (messages.map(({ message, username, time }, index) => {
			const date = new Date(time);
			return (
				<div className="chat-wrapper">
					<div key={index} className="chat">
						<span>{username}</span>
						<span>{message}</span>
					</div>
					<span className="date">{`${date.getHours()}:${date.getMinutes()}`}</span>
				</div>
			);
		}));
	}

	const genSendMessage = () => {
		return (
			<form onSubmit={handleSubmit} className="sendInput">
				<input
					placeholder="Tell us what you are thinking"
					ref={newMessageRef}
					name="userMessage"
				/>
				<button>SEND</button>
			</form>
		)
	}

	return (
		<div id="content">	
			<div id="chatContainer">
				{genMessages()}
			</div>
			{genSendMessage()}
		</div>

	);
}

export default MessagesContainer;