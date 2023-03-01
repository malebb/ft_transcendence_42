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
		
		// errors
		const [nameErr, setNameErr] = useState("");
		const [passwordErr, setPasswordErr] = useState("");

		const updateAccessibility = (newAccessibility: string) =>
		{
			setRoomAccessibility(newAccessibility);
		}

		const updatePassword = (e: React.FormEvent<HTMLInputElement>) =>
		{
			setPassword(e.currentTarget.value);
		}

		const passwordField = () => roomAccessibility === 'PROTECTED' ? <div><label>{passwordErr}</label><input type="text" placeholder="password" value={password} onChange={updatePassword} /></div>: <></>;


		const hashPassword = async (password: string) =>
		{
			const salt = await bcrypt.genSalt(10);
			return (await bcrypt.hash(password, salt));
		}

		const checkPassword = ()=> 
		{
			return (new Promise((resolve) =>
			{
				if (roomAccessibility == 'PROTECTED')
				{
					if (password.length < 10)
						setPasswordErr('Password should contain minimum 10 characters');
					else
						resolve(true);
					resolve (false);
				}
			}));
		}

		const checkName = (roomName: string) =>
		{
			if (roomName.length < 4)
				setNameErr('The room name should contain minimum 4 characters');
			else
				return (true);
			return (false);
		}

		const isNameAvailable = (name: string, chatRooms: AxiosResponse) =>
		{
			if (chatRooms.data)
			{
				setNameErr("There is already a " + name + " room");
				return (false);
			}
			return (true);
		}

  		async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>)
		{
			setNameErr('');
			setPasswordErr('');
			try
			{
				event.preventDefault();
				//@ts-ignore
   			 	const form = new FormData(event.target);
 				const roomName = form.get("roomName")!.toString().trim();
				let user: AxiosResponse;
	
				if (!checkPassword())
					return ;
				axiosInstance.current = await axiosToken();
				if (!checkName(roomName))
					return ;
				if (!isNameAvailable(roomName, await axiosInstance.current!.get('/chatRoom/' + roomName)))
					return ;
					
				axiosInstance.current = await axiosToken();
				user = await axiosInstance.current!.get('/users/me');
	
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
			<label>{nameErr}</label>
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
