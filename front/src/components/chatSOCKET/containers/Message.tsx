import { useRef, useEffect, useState, MutableRefObject } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import InputButton from "../../utils/inputs/InputButton";

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


	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

		// @ts-ignore
		const form = new FormData(event.target);
		const currentMessage = form.get("userMessage")?.toString()?.trim();

		if (!currentMessage?.length) return;

		
		// debugger;;


		// console.log({roomId, currentMessage, username});
		// emit un message vers le back
		
		// debugger;
		
		const dateTS = +new Date();
		setMessages([
			...messages,
			{
				username: "b",
				message: currentMessage,
				time: dateTS,
				roomId: 0,
			}
		])

		console.log({messages})
		
		socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, messages);

		// messages = [];


		// recevoir des messages venant d'un utilisateur de la room ?? 
		// marche pas loool
		socket.on(EVENTS.SERVER.ROOM_MESSAGE, () => {
			// console.log({ data });
			// console.log("Received message : ", {});
		});

	}

	// if (!roomId) {
	// 	return <div />;
	// }

	// let content = getElementById("content");
	// allow 1px inaccuracy by adding 1

	const genMessages = () => {

		if (!messages?.length) return;
		return (messages.map(({ message, username, time }, index) => {
			const date = new Date(time);
			return (
				<div key={index} className="chat-wrapper">
					<div className="chat">
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
			<InputButton
				onSubmit={handleSubmit}
				inputProps={{
					placeholder: "Tell us what you are thinking",
					name: "userMessage"
				}}
				buttonText="SEND"
			/>
		)
	}

	return (
		// <div id="scroll">
			<div id="content">	
				<div id="chatContainer">
					{genMessages()}
				</div>
				{genSendMessage()}
			</div>
		// </div>
	);
}

export default MessagesContainer;