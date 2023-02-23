import { Link } from "react-router-dom";

import EVENTS from "../config/events";
import { useSockets } from "../context/socket.context";
import { useState } from "react";
// import useChat from "./useChat";
import MessagesContainer from "./Message";
// import { ChatBaseRoom } from "./ChatBaseRoom";
import InputButton from "../inputs/InputButton";

interface Rooms {
  admin: string;
  nameRoom: string;
  // users: Array<User>;
  createdAt: Date;
}

function RoomsContainer(props: any) {
  //RoomContainerProps) {

  const { socket, setRoomId } = useSockets();

  const [currentRoom, setCurrentRoom] = useState<Rooms | null>(null);

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
      nameRoom: roomName,
      admin: "username",
      createdAt: new Date(),
      // users:[],
    });
  };

  const JoinRoom = () => {
    return (
      <InputButton
        onSubmit={handleCreateRoom}
        inputProps={{
          placeholder: "New room name",
          name: "roomName",
        }}
        buttonText="Create Room"
      />
    );
  };

  const DisplayCurrentRoom = () => {
    if (!currentRoom) return <></>;

    return (
      <div>
        <ul className="chat-room-created">
          <Link to={`/room/${currentRoom.nameRoom}`}>
            {currentRoom.nameRoom}
          </Link>
          <h1 id="roomContainer">Welcome to {currentRoom.nameRoom} </h1>
          <MessagesContainer />
        </ul>
      </div>
    );
  };

  return (
    <div>
      <div className="home-container">
        {currentRoom ? <DisplayCurrentRoom /> : <JoinRoom />}
      </div>
    </div>
  );
}

interface RoomContainerProps {
  username?: string;
}

export default RoomsContainer;

// function createNewRoom = () => {

// 	event.preventDefault();

// 	// Read the form data
// 	// @ts-ignore
// 	const form = new FormData(event.target);
// 	const inputMessage = form.get("messageInput")?.toString()?.trim();

// 	useEffect(() => {

// 	})

//   };
