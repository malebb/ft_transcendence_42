import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import { useRef } from 'react';

function RoomsContainer() {

	const { socket, roomId, rooms } = useSockets();
	const newRoomRef = useRef(null)

	function handleCreateRoom() {

		// get the room name
		if (!newRoomRef.current) return ;
		const roomName = newRoomRef.current['value'] || '';
		if (!String(roomName).trim()) return;

		// emit room created event
		socket.emit(EVENTS.CLIENT.CREATE_ROOM, {roomName});

		// set room name input to empty string
		// if (!newRoomRef.current) return ;
		if (newRoomRef !== null && newRoomRef.current !== null)
			newRoomRef.current.value = "";

	}

	return <nav>
		<div>
			<input ref={newRoomRef} placeholder="Room name" />
			<button onClick={handleCreateRoom}>CREATE ROOM</button>
		</div>

	</nav>;

}


export default RoomsContainer;