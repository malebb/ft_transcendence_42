import { Link, Routes, Route, useParams, BrowserRouter } from 'react-router-dom';

import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import { useRef, useEffect, useState } from 'react';
import useChat from "./useChat";
import MessagesContainer from "./Message";
import { ChatBaseRoom } from "./ChatBaseRoom";

interface Rooms {
	id: number;
	name: string;
	users: Array<number>;
}

function ChatRoom() {

	const roomId = useParams();

	const room = ChatBaseRoom.find((x) => x.id === roomId?.id);
	console.log({room});
	if (!room) return ;

	return (
		<div>
			{room && (
				<div>
				<h2>{room?.title}</h2>
					<MessagesContainer />
				</div>
			)}
		</div>
	);
}

function Landing() {
	return (
		<>
			<ul className="chat-room-list">
				{ChatBaseRoom.map((room: any) => (
					<li key={room.id}>
						<Link to={`/chat/${room.id}`}>{room.title}</Link>
						{/* {ChatRoom()} */}
					</li>
				))}
			</ul>
		</>
	);
}


function RoomsContainer(props: any) {//RoomContainerProps) {

	const { socket, roomId, rooms, setRoomId } = useSockets();
	// const newRoomRef = useRef<any>(null);
	// const username = props?.username;
	const [roomName, setRoomName] = useState<string>("");
	setRoomId(roomName);
	// const { roomId } = useSockets();
	// console.log({props}, 12)

	// useEffect(() => {
		// socket.emit(EVENTS.CLIENT.CREATE_ROOM, {roomName});
		// socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, {});

	// }, []);


	// function handleCreateRoom() {

	// 	// get the room name
	// 	if (!newRoomRef.current) return ;
	// 	const roomName1 = newRoomRef?.current?.value || '';

	// 	if (!String(roomName).trim()) return;
	// 	console.log(42, {roomName});

	// 	// emit room created event

	// 	// setRoomId(newRoomRef.current.value);
	// 	// const handleRoomNameChange = (event: any) => {
	// 		setRoomName(roomName1.current.value);
	// 	// }

	// 	// set room name input to empty string
	// 	// roomName.current.value = "";

	// }

	// useEffect(() => {
	// 	if (username && username.length){
	// 		console.log("Room created")
	// 		handleCreateRoom();
	// 	}
	// }, [username]);


	// function handleJoinRoom(key: string) {

	// 	if (key === roomId) return;
	// 	socket.emit(EVENTS.CLIENT.JOIN_ROOM, key)
	// }

	const [currentRoom, setCurrentRoom] = useState<Rooms|null>(null);

	const handleCreateRoom = () => {
		//change function name
		//create new room from name => sockets.emit
		socket.emit(EVENTS.CLIENT.CREATE_ROOM, roomName);
		setRoomId(roomName);
		setCurrentRoom({
			id: 0,
			name: roomName,
			users:[],
		});
	};

	const joinRoom = () => {
		return (
			<>
				<input
				  type="text"
				  placeholder="Room"
				  value={roomName}
				  onChange={(e: any) => setRoomName(e.target.value)}
				  className="text-input-field"
				/>
				<button className="enter-room-button" onClick={handleCreateRoom}>
				  Create room
				</button>
			</>
		)
	}

	const displayCurrentRoom = () => {
		if (!currentRoom) return;
		
		return (
			<div >
				<h1 id="roomContainer">Welcome to {currentRoom.name} </h1>
				<MessagesContainer />
				

			</div>
		)
	}

	return (
		<div> 
			<h2>Choose a Chat Room...</h2>
			<div><Landing/></div>
			<h2>...or create a new one !</h2>
			{/* <div><ChatRoom/></div> */}

		<div className="home-container">
			{currentRoom ? displayCurrentRoom() : joinRoom()}
		</div>
		</div>
	);

}


interface RoomContainerProps {
	username?:string
}


export default RoomsContainer;