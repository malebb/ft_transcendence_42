import { SocketContext } from "../context/socket.context";
import { useState, useRef, useEffect } from "react";
import InputButton from "../inputs/InputButton";
import { accessibilities } from "../utils/RoomAccessibilities";
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken, axiosMain } from '../../../api/axios';
import bcrypt from 'bcryptjs';
import { ChatRoom, Accessibility } from 'ft_transcendence';
import './rooms.style.css';
import EVENTS from '../config/events';
import { ChatRoomFilter } from '../utils/ChatRoomFilter';

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

		const passwordField = () => roomAccessibility === 'PROTECTED' ? <div><label>{passwordErr}</label><input type="password" placeholder="Enter a password" value={password} onChange={updatePassword} /></div>: <></>;

		const hashPassword = async (password: string) =>
		{
			const salt = await bcrypt.genSalt(10);
			return (await bcrypt.hash(password, salt));
		}

		const checkPassword = (): boolean => 
		{
			if (roomAccessibility === 'PROTECTED')
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
				window.location.reload();
			}
			catch (error: any)
			{
				console.log('error during room creation: ', error);
			}
   		}
		return (
		<>
		<h3 id="createRoomTitle">Create a new room ... </h3>
		<div id="createRoom">
		<ul id="accessibility">
			{
				accessibilities.map((accessibility: string, index: number) =>
				{
					return (
							<li key={index} className="checkboxes">
								<input type="checkbox" name={accessibility}
								checked={accessibility === roomAccessibility }
								onChange={() => updateAccessibility(accessibility)}/>
								<label> {accessibility.toLowerCase()}</label>
							</li>
					);
				})
			}
			{passwordField()}
		</ul>
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
		</div>
		</>
		);
	}

	const RoomList = () =>
	{
		const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);
		const [chatRoomSelected, setChatRoomSelected] = useState<string>('');
		const [roomPassword, setRoomPassword] = useState<string>('');
		const [passwordPlaceholder, setPasswordPlaceholder] = useState<string>('Enter password');
		const [chatRoomFilter, setChatRoomFilter] = useState<ChatRoomFilter>(ChatRoomFilter["JOINED"]);

		const updateChatRoomFilter = (e: React.FormEvent<HTMLSelectElement>) =>
		{
			setChatRoomFilter(ChatRoomFilter[e.currentTarget.value as keyof typeof ChatRoomFilter]);
		}

		const filterChatRoom = () =>
		{
			return (
				<select value={chatRoomFilter} onChange={updateChatRoomFilter}>
          	  		<option value="JOINED">Rooms joined</option>
					<option value="NOT_JOIN">Rooms not joined</option>
				</select>
			);
		}

		const accessibilityLogo = (accessibility: Accessibility) =>
		{
			const logoWidth = 25;

			switch (accessibility)
			{
				case 'PUBLIC':
					return (<img src="http://localhost:3000/images/public.png" width={logoWidth} height={logoWidth}/>);
				case 'PRIVATE':
					return (<img src="http://localhost:3000/images/private.png" width={logoWidth} height={logoWidth}/>);
				case 'PROTECTED':
					return (<img src="http://localhost:3000/images/protected.png" width={logoWidth} height={logoWidth}/>);
			}
		}

		const joinRoom = async (roomName: string) =>
		{
			try {
				axiosInstance.current = await axiosToken();
				const user: AxiosResponse = await axiosInstance.current.get('/users/me', {});

				await axiosInstance.current.post('/chatRoom/' + roomName,
					{username: user.data.email},
					{headers: {'Content-Type': 'application/json'},
				});
				window.location.href = 'http://localhost:3000/room/' + roomName;
			}
			catch (error: any)
			{
				console.log("An error occured when joining the room: ", error);
			}
		}

		const updateRoomPassword = (e: React.FormEvent<HTMLInputElement>) =>
		{
			setRoomPassword(e.currentTarget.value);
		}

		const checkPassword = async (e: React.FormEvent<HTMLFormElement>, chatRoom: ChatRoom) =>
		{
			e.preventDefault();
			if (await bcrypt.compare(roomPassword, chatRoom.password))
				joinRoom(chatRoom.name);
			else
			{
				setPasswordPlaceholder('Wrong password');
				setRoomPassword('');
			}
		}

		const displayChatRooms = () =>
		{
			if (!chatRoomList.length)
				return (<p>No room chat have been created</p>);
			const printRoomInfo = (chatRoom: ChatRoom) =>
			{
				if (chatRoomSelected == chatRoom.name)
				{
					switch (chatRoom.accessibility)
					{
						case 'PROTECTED':
							return (<div>
									<form onSubmit={(e) => checkPassword(e, chatRoom)}>
										<input type="password"
											placeholder={passwordPlaceholder} value={roomPassword}
											onChange={updateRoomPassword}
											autoComplete="on"
											/>
									<input type="submit" />
									</form>
								</div>);
						case 'PRIVATE':
							return (<span>This room is private</span>);
						case 'PUBLIC':
							joinRoom(chatRoom.name);
					}
				}
				return (	<>
								<p className="owner">Owner : {chatRoom.owner.username}</p>
								{accessibilityLogo(chatRoom.accessibility)}
							</>
						);
			}

			const updateSelectChatRoom = (chatRoomSelected: string) =>
			{
				setChatRoomSelected(chatRoomSelected);
			}

			return(
				<ul id="roomList">
				{
					chatRoomList.map((chatRoom) => {
						return (
							<li className="chatRoom" key={chatRoom.name} onClick={() => updateSelectChatRoom(chatRoom.name)}>
								<h3 className="roomTitle">{chatRoom.name}</h3>
						<div className="roomInfo">
								{printRoomInfo(chatRoom)}
						</div>
							</li>
						);
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
					const chatRooms = await axiosInstance.current!.get('/chatRoom/');
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
				<h3 id="joinRoomTitle">... Or join one!</h3>
				{filterChatRoom()}
				{displayChatRooms()}
			</div>
		);
	}

	return (
		<div id="rooms">
			<CreateRoom />
			<br/>
			<br/>
			<RoomList />
		</div>
	);
}

export default Rooms;
