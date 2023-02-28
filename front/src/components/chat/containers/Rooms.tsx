import { Link } from "react-router-dom";

import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import { useState } from "react";
// import useChat from "./useChat";
import MessagesContainer from "./Message";
// import { ChatBaseRoom } from "./ChatBaseRoom";
import InputButton from "../inputs/InputButton";
import { accessibilities } from "../utils/RoomAccessibilities";
import bcrypt from 'bcryptjs';

interface ChatRoom
{
	admin: string;
	nameRoom: string;
	password: string;
	accessibility: string;
}

function RoomsContainer(props: any)
{
	const socket = SocketContext();

	const CreateRoom = () =>
	{
		const [roomAccessibility, setRoomAccessibility] = useState("Public");
		const [password, setPassword] = useState("");

		const updateAccessibility = (newAccessibility: string) =>
		{
			setRoomAccessibility(newAccessibility);
		}

		const updatePassword = (e: React.FormEvent<HTMLInputElement>) =>
		{
			setPassword(e.currentTarget.value);
		}

		const passwordField = () => roomAccessibility === 'Protected' ? <input type="text" placeholder="password" value={password} onChange={updatePassword} />: <></>;

		const checkPassword = () => 
		{
			if (roomAccessibility == 'Protected')
			{
				
			}
		}

		const hashPassword = async (password: string) =>
		{
			const salt = await bcrypt.genSalt(10);
			return (await bcrypt.hash(password, salt));
		}

  		async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>)
		{
			event.preventDefault();
			//@ts-ignore
   		 	const form = new FormData(event.target);
 			const roomName = form.get("roomName")?.toString()?.trim();

	    	if (!roomName?.length) return;
			checkPassword();
			let newRoom: ChatRoom =
			{
				admin: "ldermign",
				nameRoom: form.get("roomName")!.toString().trim(),
				accessibility: roomAccessibility,
				password: await hashPassword(password)
			};
			socket.emit(EVENTS.CLIENT.CREATE_ROOM, newRoom);
			console.log("new room to be created = ", newRoom);
   		}
		return (
		<>
			<InputButton
          		onSubmit={handleCreateRoom}
          		inputProps={{
           			placeholder: "New room name",
            		name: "roomName",
          		}}
          		buttonText="Create Room" />
		<ul id="accessibility">
			{
				accessibilities.map((accessibility: string, index: number) =>
				{
					return (
						<li key={index}>
							<input type="checkbox" name={accessibility}
							checked={accessibility === roomAccessibility }
							onChange={() => updateAccessibility(accessibility)}/>
							<label>{accessibility}</label>
						</li>
					);
				})
			}
			{passwordField()}
		</ul>
		</>
		);
	}
	return (<CreateRoom / >);
}

export default RoomsContainer;


/*
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
*/
    // if (!currentRoom) return <></>;

interface RoomContainerProps {
  username?: string;
}


// function createNewRoom = () => {

// 	event.preventDefault();

// 	// Read the form data
// 	// @ts-ignore
// 	const form = new FormData(event.target);
// 	const inputMessage = form.get("messageInput")?.toString()?.trim();

// 	useEffect(() => {

// 	})

//   };
