import { Link, Routes, Route, useParams, BrowserRouter } from 'react-router-dom';
import { useRef, useEffect, useState } from "react";
import { useSockets } from './context/socket.context';
import RoomsContainer from './containers/Rooms';
import MessagesContainer from './containers/Message';
import {io} from 'socket.io-client';
// import ChatRoom from "./containers/ChatRoom";
import { ChatBaseRoom } from "./containers/ChatBaseRoom";


// const socket = io("http://localhost:4444");

// doc: https://v5.reactrouter.com/web/example/url-params


const Chat = () => {
	const {roomId} = useParams();
	const [user, setUser] = useState<string>("");
	const { socket, username, setUsername } = useSockets();
	const usernameRef = useRef<HTMLInputElement>(null)

	console.log({roomId})

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

	useEffect(() => {

		// debugger; POUR VOIR STEP BYSTEP 

		const value = usernameRef?.current?.value;
		if (!value) {
			return ;
		}
		setUsername(value);
		setUser(value);

		// socket.on('connect', () => {
		// 	console.log("Connected");
		// });

		// socket.on("connection2", (socket: any) => {
				
		// 	// Join a conversation
		// 	const { roomId } = socket.handshake.query;
		// 	socket.join(roomId);
		  
		// 	// Listen for new messages
		// 	socket.on("newChatMessage", (data: any) => {
		// 	  socket.in(roomId).emit("newChatMessage", data);
		// 	});
	
		// 	// Leave the room if the user closes the socket
		// 	socket.on("disconnect", () => {
		// 	  socket.leave(roomId);
		// 	});
		//   });

		// return () => {
		// 	socket.off('connect');
		// 	// socket.off('connection2');
		// };
	},[]);
	


	return (
		<div>
		  {/* {!user && (
			<div >
			  <div >
				<input placeholder="Username" ref={usernameRef} />
				<button className="cta" onClick={handleSetUsername}>
				  START
				</button>
			  </div>
			</div>
		  )}
		  {user && ( */}
			<div >
				{/* <Route exact path="/:roomId" component={RoomsContainer} /> */}
			{/* <BrowserRouter> */}
				{/* <Routes>
	                <Route path="/" element={<Landing />} />
	                <Route path="/chat/:id" element={<ChatRoom />} />
					
	            </Routes> */}
			<div>

			</div>
			{/* </BrowserRouter> */}
			  <RoomsContainer />
			  {/* <MessagesContainer /> */}

			</div>
		  {/* )} */}
		</div>
	  );
}

export default Chat;
