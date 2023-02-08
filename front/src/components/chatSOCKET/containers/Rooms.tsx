
import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import { useRef, useEffect } from 'react';

function RoomsContainer(props:RoomContainerProps) {

	const { socket, roomId, rooms } = useSockets();
	const newRoomRef = useRef<any>(null);
	// const newRoomRef = useRef(null);
	const username = props?.username;

	console.log({props}, 12)

	useEffect(() => {
		if (username && username.length){
			console.log("Room created")
			handleCreateRoom();
		}
	}, [username]);

	function handleCreateRoom() {

		// get the room name
		// if (!newRoomRef.current) return ;
		const roomName = newRoomRef.current.value || '';

		if (!String(roomName).trim()) return;

		// emit room created event
		socket.emit(EVENTS.CLIENT.CREATE_ROOM, {roomName});

		// set room name input to empty string
		// if (!newRoomRef.current || !newRoomRef.current) return ;
		// if (newRoomRef !== null && newRoomRef.current !== null)
		newRoomRef.current.value = "";

	}

	function handleJoinRoom(key: string) {
		if (key === roomId) return;

		socket.emit(EVENTS.CLIENT.JOIN_ROOM, key)
	}

	return ( <nav>
		<div>
			<input ref={newRoomRef} placeholder="Room name" />
			<button className="cta" onClick={handleCreateRoom}>CREATE ROOM</button>
		</div>

{/* // key = roomId */}
		{Object.keys(rooms).map((key) => {
			return <div key={key}>
				<button
				disabled={key === roomId}
				title={`Join ${rooms[key].name}`}
				onClick={() => handleJoinRoom(key)}
				>
				{rooms[key].name}

				</button>
			</div>;
		})}

	</nav>)

}

interface RoomContainerProps {
	username?:string
}


export default RoomsContainer;