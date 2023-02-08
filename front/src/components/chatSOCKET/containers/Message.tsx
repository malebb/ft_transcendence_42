import { useRef, useEffect } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";

function MessagesContainer() {

	const { socket, messages, roomId, username, setMessages} = useSockets();
	const newMessageRef = useRef<any>(null);

	function handleSendMessage() {
		const message = newMessageRef.current.value;

		if (!String(message).trim()) {
			return ;
		}

		socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, {roomId, message, username});

		const date = new Date()

		setMessages(messages ? [
			...messages,
			{
				username: 'You',
				message,
				time: `${date.getHours()}:${date.getMinutes}`,
			},
		] : [messages]);

		newMessageRef.current.value = "";

	}

	if (!roomId) {
		return <div />;
	}

	return (
		<div>

			{messages && messages.map(({message}, index) => {
				return <p key={index}>{message}</p>;
			})}

			<div>
				<textarea
				rows={1}
				placeholder="Faut ecrire ici en fait"
				ref={newMessageRef}
				/>

				<button onClick={handleSendMessage}>SEND</button>
			</div>

		</div>
	);
}

export default MessagesContainer;