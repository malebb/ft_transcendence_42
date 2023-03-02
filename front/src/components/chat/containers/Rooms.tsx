import { Link } from "react-router-dom";
import EVENTS from "../config/events";
import { SocketContext } from "../context/socket.context";
import { useState, useRef, useEffect } from "react";
import MessagesContainer from "./Message";
import InputButton from "../inputs/InputButton";
import { accessibilities } from "../utils/RoomAccessibilities";
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken } from '../../../api/axios';
import bcrypt from 'bcryptjs';
import { ChatRoom, Accessibility } from 'ft_transcendence';
import './rooms.style.css';

function Rooms()
{
	const socket = SocketContext();
	const axiosInstance = useRef<AxiosInstance | null>(null);

	const CreateRoom = () =>
	{
		const [roomAccessibility, setRoomAccessibility] = useState("PUBLIC");
		const [password, setPassword] = useState("");
		const [name, setName] = useState("");
		
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

		const updateName = (e: React.FormEvent<HTMLInputElement>) =>
		{
			setName(e.currentTarget.value);
		}

		const passwordField = () => roomAccessibility === 'PROTECTED' ? <div><label>{passwordErr}</label><input type="password" placeholder="password" value={password} onChange={updatePassword} /></div>: <></>;

		const hashPassword = async (password: string) =>
		{
			const salt = await bcrypt.genSalt(10);
			return (await bcrypt.hash(password, salt));
		}

		const checkPassword = (): boolean => 
		{
			if (roomAccessibility == 'PROTECTED')
			{
				if (password.length < 10)
					setPasswordErr('Password should contain minimum 10 characters');
				else
					return (true);
				return (false);
			}
			return (true);
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
					owner: {...user.data},
					name: form.get("roomName")!.toString().trim(),
					accessibility: Accessibility[roomAccessibility as keyof typeof Accessibility],
					password: await hashPassword(password)
				};
				socket.emit(EVENTS.CLIENT.CREATE_ROOM, newRoom);
				setName('');
				setPassword('');
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
					value: name,
					onChange: updateName
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

	const RoomList = () =>
	{
		const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);

		const displayChatRooms = () =>
		{
			if (!chatRoomList.length)
				return (<p>No room chat have been created</p>);
			return(
				<ul id="roomList">
				{
					chatRoomList.map((chatRoom) => {
						return (
						<Link className="roomLink" to={`/room/${chatRoom.name}`} key={chatRoom.name}>
							<li className="chatRoom"><h3 className="roomTitle">{chatRoom.name}</h3>
													<p>Owner: {chatRoom.owner.username}</p></li>
						</Link>);
					})
				}
				</ul>
			)
				
		}

		useEffect(() =>
		{
			const initChatRoomList = async () => 
			{
				try
				{
					axiosInstance.current = await axiosToken();
					const chatRooms = await axiosInstance.current!.get('/chatRoom');
					setChatRoomList(chatRooms.data.sort((a: ChatRoom, b: ChatRoom) =>
					(a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)));
				}
				catch (error: any)
				{
					console.log("error while displaying chat rooms: ", error);
				}
			}
			initChatRoomList();
		}, []);

		return (
			<div>
				{displayChatRooms()}
			</div>
		);
	}

	return (
		<div id="rooms">
			<CreateRoom />
			<RoomList />
		</div>
	);
}

export default Rooms;
