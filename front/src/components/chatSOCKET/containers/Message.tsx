import { useRef, useEffect } from "react";
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";

function MessagesContainer() {

	const { socket, messages, roomId, username, setMessages} = useSockets();
	const newMessageRef = useRef<any>(null);
	const messageEndRef = useRef<any>(null);

	function handleSendMessage() {

		const message = newMessageRef.current.value;
		
		if (!String(message).trim()) {
			// console.log({message});
			return ;
		}
		
		// console.log({message});
		socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, {roomId, message, username}, () => {
			
			console.log(username + " send a message in room " + roomId);
			console.log(42,{message});
			
		});
		
		// OKKKKK
		
		const date = new Date()
		
		setMessages(message ? [
			...message,
			{
				roomId: roomId,
				username: 'You',
				message,
				time: `${date.getHours()}:${date.getMinutes}`,
			},
		] : [message]);

		// console.log({message});

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