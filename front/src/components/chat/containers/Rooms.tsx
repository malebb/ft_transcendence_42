import { Link } from "react-router-dom";

import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import { useState } from "react";
// import useChat from "./useChat";
import MessagesContainer from "./Message";
// import { ChatBaseRoom } from "./ChatBaseRoom";
import InputButton from "../inputs/InputButton";

interface Room {
  admin: string;
  nameRoom: string;
  // users: Array<User>;
  createdAt: Date;
}

function RoomsContainer(props: any) {
  let newRoom: Room = {
    admin: "ldermign",
    nameRoom: "",
    createdAt: new Date(),
  };

  const [currentRoom, setCurrentRoom] = useState<Room | null>({
    ...newRoom,
  });

  const socket = SocketContext();

  function handleCreateRoom(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    //@ts-ignore
    const form = new FormData(event.target);
    const roomName = form.get("roomName")?.toString()?.trim();

    if (!roomName?.length) return;

    newRoom = {
      ...newRoom,
      nameRoom: roomName,
    };

    socket.emit(EVENTS.CLIENT.CREATE_ROOM, {newRoom});
  }

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
    // if (!currentRoom) return <></>;

    return (
      <>
        <InputButton
          onSubmit={handleCreateRoom}
          inputProps={{
            placeholder: "New room name",
            name: "roomName",
          }}
          buttonText="Create Room"
        />
        <ul className="chat-room-created">
          <Link to={`/room/${currentRoom?.nameRoom}`}>
            {currentRoom?.nameRoom}
          </Link>
          {/* <h1 id="roomContainer">Welcome to {currentRoom.nameRoom} </h1>
          <MessagesContainer /> */}
        </ul>
      </>
    );
  };

  return (
    <div>
      <div className="home-container">
        <DisplayCurrentRoom />
        {/* {currentRoom ? <DisplayCurrentRoom /> : <JoinRoom />} */}
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
