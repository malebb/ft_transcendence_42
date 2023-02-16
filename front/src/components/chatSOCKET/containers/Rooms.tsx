import { Link, Routes, Route, useParams, BrowserRouter } from 'react-router-dom';

import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import { useRef, useEffect, useState } from 'react';
import useChat from "./useChat";
import MessagesContainer from "./Message";
import { ChatBaseRoom } from "./ChatBaseRoom";
import InputButton from "../../utils/inputs/InputButton";


interface Rooms {
	id: number;
	name: string;
	users: Array<number>;
}

function RoomsContainer(props: any) {//RoomContainerProps) {

	const { socket, roomId, rooms, setRoomId } = useSockets();
	// const newRoomRef = useRef<any>(null);
	// const username = props?.username;
	// setRoomId(roomName);
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

	const handleCreateRoom = (event: React.FormEvent<HTMLFormElement>) => {
		//change function name
		//create new room from name => sockets.emit

		//@ts-ignore
		const form = new FormData(event.target);
		const roomName = form.get("roomName")?.toString()?.trim();

		if (!roomName?.length) return;


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
			<InputButton
				onSubmit={handleCreateRoom}
				inputProps={{
					placeholder: "New room name",
					name: "roomName"
				}}
				buttonText="Create Room"
			/>
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