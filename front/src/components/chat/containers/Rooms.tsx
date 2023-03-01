import { Link } from "react-router-dom";

import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import { useState, useRef, useEffect } from "react";
// import useChat from "./useChat";
import MessagesContainer from "./Message";
// import { ChatBaseRoom } from "./ChatBaseRoom";
import InputButton from "../inputs/InputButton";
import { accessibilities } from "../utils/RoomAccessibilities";
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken } from '../../../api/axios';
import bcrypt from 'bcryptjs';
import { ChatRoom, Accessibility } from 'ft_transcendence';

function RoomsContainer(props: any)
{
	const socket = SocketContext();

	const CreateRoom = () =>
	{
		const [roomAccessibility, setRoomAccessibility] = useState("PUBLIC");
		const [password, setPassword] = useState("");
		const axiosInstance = useRef<AxiosInstance | null>(null);

		const updateAccessibility = (newAccessibility: string) =>
		{
			setRoomAccessibility(newAccessibility);
		}

		const updatePassword = (e: React.FormEvent<HTMLInputElement>) =>
		{
			setPassword(e.currentTarget.value);
		}

		const passwordField = () => roomAccessibility === 'PROTECTED' ? <input type="text" placeholder="password" value={password} onChange={updatePassword} />: <></>;

		const checkPassword = (): boolean => 
		{
			if (roomAccessibility == 'PROTECTED')
			{
				if (password.length < 10)
					return (false);
			}
			return (true);
		}

		const hashPassword = async (password: string) =>
		{
			const salt = await bcrypt.genSalt(10);
			return (await bcrypt.hash(password, salt));
		}

  		async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>)
		{
			try
			{
				event.preventDefault();
				//@ts-ignore
   			 	const form = new FormData(event.target);
 				const roomName = form.get("roomName")?.toString()?.trim();
				let user: AxiosResponse;
	
		    	if (!roomName?.length) return;
				if (!checkPassword())
					return ;
				axiosInstance.current = await axiosToken();
			
				user = await axiosInstance.current.get('/users/me');
	
				let newRoom: ChatRoom =
				{
					owner: user.data.username,
					name: form.get("roomName")!.toString().trim(),
					accessibility: Accessibility[roomAccessibility as keyof typeof Accessibility],
					password: await hashPassword(password)
				};
				socket.emit(EVENTS.CLIENT.CREATE_ROOM, newRoom);
				console.log("new room to be created = ", newRoom);
			}
			catch (error: any)
			{
				console.log('error during room creation: ', error);
			}
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
							<label>{accessibility.toLowerCase()}</label>
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
