import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import { useRef, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import useChat from "./useChat";
import MessagesContainer from "./Message";

interface room {
	id: number;
	name: string;
	users: Array<number>;
}

function RoomsContainer(props: any) {//RoomContainerProps) {

	// const { socket, roomId, rooms, setRoomId } = useSockets();
	// const newRoomRef = useRef<any>(null);
	// const username = props?.username;
	const [roomName, setRoomName] = useState<string>("");
	const { roomId } = useSockets();
	// console.log({props}, 12)



	// function handleCreateRoom() {

	// 	// get the room name
	// 	if (!newRoomRef.current) return ;
	// 	const roomName1 = newRoomRef?.current?.value || '';

	// 	if (!String(roomName).trim()) return;
	// 	console.log(42, {roomName});

	// 	// emit room created event
	// 	socket.emit(EVENTS.CLIENT.CREATE_ROOM, {roomName});

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

	const [currentRoom, setCurrentRoom] = useState<room|null>(null);

	const handleCreateRoom = () => {
		//change function name
		//create new room from name => sockets.emit
		// roomId = roomName;
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
			<div>
				<h1>Welcome to {currentRoom.name} </h1>
				<MessagesContainer />
				{/* console.log({currentRoom.name}); */}

			</div>
		)
	}

	return (
// 	<nav>
// 		<div>
// 			<input ref={roomName} placeholder="Room name" />
// 			<button className="cta" onClick={handleCreateRoom}>CREATE ROOM</button>
// {/* </div> */}
// {/* // key = roomId */}
// 		{Object.keys(rooms).map((key) => {
// 			return <div key={key}>
// 				<button
// 					disabled={key === roomId}
// 					title={`Join ${rooms[key].name}`}
// 					onClick={() => handleJoinRoom(key)}
// 					>
// 				{rooms[key].name}

// 				</button>
// 			</div>;
// 		})}

// 		</div>


// 	</nav>)

	<div className="home-container">
		{currentRoom ? displayCurrentRoom() : joinRoom()}
	</div>
	);

}

interface RoomContainerProps {
	username?:string
}


export default RoomsContainer;