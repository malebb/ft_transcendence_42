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
	
	const Landing = () => {
		return (
			<>
				<ul className="chat-room-list">
					{ChatBaseRoom.map((room: any) => (
						<li key={room.id}>
							<Link to={`/room/${room.id}`}>{room.title}</Link>
						</li>
					))}
				</ul>
			</>
		);
	}

	const ChatRoom = () => {

		// const roomId = useParams();
	
		const room = ChatBaseRoom.find((x) => x.id === roomId);
		console.log({room});
		if (!room) return ;
	
		return (
			<div>
				{room && (
					<div>
							<h2>{room?.title}</h2>
							<div onClick={ () => {
								socket?.emit("joinRoom", { roomId });
							}}/>
					</div>
				)}
			</div>
		);
	}

	const rien = () => {
		return (
			<div>

			</div>
		)
	}


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
			{/* <div > */}
				{/* <Route exact path="/:roomId" component={RoomsContainer} /> */}
			{/* <BrowserRouter> */}
				{/* <Routes>
	                <Route path="/" element={<Landing />} />
	                <Route path="/chat/:id" element={<ChatRoom />} />
					
	            </Routes> */}
			{/* <div> */}
			<h2>Choose a Chat Room...</h2>
			<div><Landing/></div>
			<h2>...or create a new one !</h2>
			<div>
				{roomId ? ChatRoom() : rien()}
			</div>
			<div>
			  <RoomsContainer />
			  {/* <MessagesContainer /> */}
			</div>
		  {/* )} */}
		</div>
	  );
}

export default Chat;
