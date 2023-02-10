import { useRef, useEffect, useState } from "react";
import { useSockets } from './context/socket.context';
import RoomsContainer from './containers/Rooms';
import MessagesContainer from './containers/Message';
import { io } from 'socket.io-client';
import ChatRoom from "./containers/ChatRoom";


const socket = io();

const Chat = () => {
	
	const [user, setUser] = useState<string>("");
	const { socket, username, setUsername } = useSockets();
	const usernameRef = useRef<HTMLInputElement>(null)

	function handleSetUsername() {

		const value = usernameRef?.current?.value;
		if (!value) {
			return ;
		}
		setUsername(value);
		setUser(value);
		
		console.log(value);
		localStorage.setItem("username", JSON.stringify(value));
	}

	useEffect(() => {
		if (usernameRef && usernameRef.current)
			usernameRef.current.value = localStorage.getItem("username") || "";
	}, []);
	
	socket.on("connection", (socket: any) => {
  
		// Join a conversation
		const { roomId } = socket.handshake.query;
		socket.join(roomId);
	  
		// Listen for new messages
		socket.on("newChatMessage", (data: any) => {
		  socket.in(roomId).emit("newChatMessage", data);
		});

		// Leave the room if the user closes the socket
		socket.on("disconnect", () => {
		  socket.leave(roomId);
		});
	  });

	return (
		<div>
		  {!user && (
			<div >
			  <div >
				<input placeholder="Username" ref={usernameRef} />
				<button className="cta" onClick={handleSetUsername}>
				  START
				</button>
			  </div>
			</div>
		  )}
		  {user && (
			<div >
				{/* <Route exact path="/:roomId" component={RoomsContainer} /> */}
			  <RoomsContainer username={user}/>
			</div>
		  )}
		</div>
	  );
}

export default Chat;
