import { useRef, useEffect } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";

function MessagesContainer() {

	const { socket, messages, roomId, username, setMessages} = useSockets();
	const newMessageRef = useRef<any>(null);
	const messageEndRef = useRef<any>(null);

	function handleSendMessage() {

		const message = newMessageRef.current.value;
		// console.log({message});

		if (!String(message).trim()) {
			console.log({message});
			return ;
		}

		socket.emit("SEND_ROOM_MESAGE", {roomId, message, username}, () => {
	
			
		});
		
		// OKKKKK
		// console.log({message});
		
		const date = new Date()
		
		setMessages(messages ? [
			...messages,
			{
				roomId: roomId,
				username: 'You',
				message,
				time: `${date.getHours()}:${date.getMinutes}`,
			},
		] : [messages]);

		newMessageRef.current.value = "";
	}

	// useEffect(() => {
	// 	messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	//   }, [messages]);

	// if (!roomId) {
	// 	return <div />;
	// }

	return (
		// <div>
		// 	{/* console.log({"quarante-deux"}) */}
		// 	{messages && messages.map(({message}, index) => {
		// 		return <p key={index}>{message}</p>;
		// 	})}

		// 	<div>
		// 		<textarea
		// 		rows={1}
		// 		placeholder="Faut ecrire ici en fait"
		// 		ref={newMessageRef}
		// 		/>

		// 		<button onClick={handleSendMessage}>SEND</button>
		// 	</div>

		// </div>
		<div >
		  {messages && messages.map(({ message, username, time }, index) => {
			return (
				<div key={index} >
				  <span >
					{username} - {time}
				  </span>
				  <span >{message}</span>
			  </div>
			);
		  })}
		  <div ref={messageEndRef} />

			<div >
			  <textarea
				rows={1}
				placeholder="Tell us what you are thinking"
				ref={newMessageRef}
			  />
			  <button onClick={handleSendMessage}>SEND</button>
			</div>
		  </div>
	
		);
}

export default MessagesContainer;