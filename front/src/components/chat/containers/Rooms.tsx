import { useState, useRef, useEffect } from "react";
import InputButton from "../inputs/InputButton";
import { accessibilities } from "../utils/RoomAccessibilities";
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken } from '../../../api/axios';
import { ChatRoom, Accessibility } from 'ft_transcendence';
import './rooms.style.css';
import EVENTS from '../config/events';
import { ChatRoomFilter } from '../utils/ChatRoomFilter';

function Rooms()
{
	const axiosInstance = useRef<AxiosInstance | null>(null);

	const CreateRoom = () =>
	{
		const [roomAccessibility, setRoomAccessibility] = useState('');
		const [password, setPassword] = useState("");
		const [name, setName] = useState("");
		const regexPassword = useRef(/^[0-9]*$/);
		const [nameInfo, setNameInfo] = useState("");
		const [passwordInfo, setPasswordInfo] = useState("4 digits password : ");

		const updateAccessibility = (newAccessibility: string) =>
		{
			const passwordInfo = document.getElementById('creationPasswordInfo');

			if (passwordInfo)
				passwordInfo.style.color = 'white';
			setPasswordInfo('4 digits password :');
			setRoomAccessibility(newAccessibility);
		}

		const updatePassword = (e: React.FormEvent<HTMLInputElement>) =>
		{
			if (regexPassword.current.test(e.currentTarget.value) && e.currentTarget.value.length <= 4)
				setPassword(e.currentTarget.value);
			if (!regexPassword.current.test(e.currentTarget.value))
			{
				setPasswordInfo('only digits :');
				document.getElementById('passwordInfo')!.style.color = 'red';
			}
		}

		const updateName = (e: React.FormEvent<HTMLInputElement>) =>
		{
			setName(e.currentTarget.value);
		}

		const passwordField = () => roomAccessibility === 'PROTECTED' ? <div id="creationPassword"><label id="passwordInfo">{passwordInfo}</label><input id="creationPasswordInput" type="password" value={password} onChange={updatePassword} autoComplete="on"/></div>: <></>;

		const checkPassword = (): boolean => 
		{
			if (roomAccessibility === 'PROTECTED')
			{
				if (password.length !== 4)
				{
					setPasswordInfo('4 digits required :');
					document.getElementById('passwordInfo')!.style.color = 'red';
				}
				else
					return (true);
				return (false);
			}
			return (true);
		}

		const checkName = (roomName: string) =>
		{
			if (roomName.length < 4)
			{
				setNameInfo('Minimum 4 characters');
				document.getElementById('nameInfo')!.style.color = 'red';
			}
			else if (roomName.length > 25)
			{
				setNameInfo('Maximum 25 characters');
				document.getElementById('nameInfo')!.style.color = 'red';
			}
			else if (!/^[A-Za-z0-9 ]*$/.test(roomName))
			{
				setNameInfo('Only numbers or letters');
				document.getElementById('nameInfo')!.style.color = 'red';
			}
			else
				return (true);
			return (false);
		}

		const isNameAvailable = (name: string, chatRooms: AxiosResponse) =>
		{
			if (chatRooms.data)
			{
				setNameInfo("There is already a " + name + " room");
				return (false);
			}
			return (true);
		}

  		async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>)
		{
			setNameInfo('');
			setPasswordInfo('');
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
					password: roomAccessibility === 'PROTECTED' ? password : ''
				};
				axiosInstance.current = await axiosToken();
				await axiosInstance.current!.post('/chatRoom/',
					newRoom,
					{headers: {'Content-Type': 'application/json'},
				});

				setName('');
				setPassword('');
				window.location.reload();
			}
			catch (error: any)
			{
				console.log('error during room creation: ', error);
			}
   		}

		const formatAccessibility = (accessibility: string) =>
		{
			return ((accessibility.toLowerCase().charAt(0).toUpperCase() + accessibility.slice(1).toLowerCase()));
		}

		useEffect(() =>
		{
			setRoomAccessibility("PUBLIC");
		}, []);

		const handleAccessibilityForm = (e: React.FormEvent<HTMLFormElement>) =>
		{
			e.preventDefault();
		}

		return (
		<>
		<h3 id="createRoomTitle">Create a new room ... </h3>
		<div id="createRoom">
			<form id="accessibility" onSubmit={handleAccessibilityForm}>
				<ul id="checkboxes">
					{
						accessibilities.map((accessibility: string, index: number) =>
						{
							return (
									<li key={index}>

										<label className="checkboxContainer">
											<input type="checkbox" name={accessibility}
											checked={accessibility === roomAccessibility}
											onChange={() => updateAccessibility(accessibility)}
											/>
											<span className="customCheckbox"></span>
										</label>
										<label> {formatAccessibility(accessibility)}</label>
									</li>
							);
						})
					}
				</ul>
				{passwordField()}
			</form>
			<label id="nameInfo">{nameInfo}</label>
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
		const [chatRoomsList, setChatRoomsList] = useState<ChatRoom[]>([]);
		const [chatRoomSelected, setChatRoomSelected] = useState<string>('');
		const accessibilityAfterSelect = useRef();
		const [roomPassword, setRoomPassword] = useState<string>('');
		const [chatRoomFilter, setChatRoomFilter] = useState<ChatRoomFilter>(ChatRoomFilter["JOINED"]);
		const [infoPassword, setInfoPassword] = useState<string>('4 digits password : ');
		const regexPassword = useRef(/^[0-9]*$/);

		const updateChatRoomFilter = (e: React.FormEvent<HTMLSelectElement>) =>
		{
			setChatRoomFilter(ChatRoomFilter[e.currentTarget.value as keyof typeof ChatRoomFilter]);
		}

		const filterChatRoom = () =>
		{
			return (
			<div id="filter">
				<select value={chatRoomFilter} onChange={updateChatRoomFilter}>
          	  		<option value="JOINED">Rooms joined</option>
					<option value="NOT_JOINED">Rooms not joined</option>
				</select>
			</div>
			);
		}

		const accessibilityLogo = (accessibility: Accessibility, password: string) =>
		{
			const logoWidth = 25;

			switch (accessibility)
			{
				case 'PUBLIC':
					return (<img src="http://localhost:3000/images/public.png" width={logoWidth} height={logoWidth} alt={accessibility}/>);
				case 'PRIVATE':
					return (password.length ? <img src="http://localhost:3000/images/protected.png" width={logoWidth} height={logoWidth} alt={accessibility}/>
					: <img src="http://localhost:3000/images/private.png" width={logoWidth} height={logoWidth} alt={accessibility}/>);
				case 'PROTECTED':
					return (<img src="http://localhost:3000/images/protected.png" width={logoWidth} height={logoWidth} alt={accessibility}/>);
			}
		}

		const enterRoom = async (roomName: string) =>
		{
			window.location.href = 'http://localhost:3000/chat/room/' + roomName;
		}

		const joinRoom = async (roomName: string) =>
		{
			try {
				axiosInstance.current = await axiosToken();
				const user: AxiosResponse = await axiosInstance.current.get('/users/me');

				await axiosInstance.current.post('/chatRoom/' + roomName,
					{userId: user.data.id},
					{headers: {'Content-Type': 'application/json'},
				});
				enterRoom(roomName);
			}
			catch (error: any)
			{
				console.log("An error occured when joining the room: ", error);
			}
		}

		const updateRoomPassword = (e: React.FormEvent<HTMLInputElement>) =>
		{
			if (regexPassword.current.test(e.currentTarget.value) && e.currentTarget.value.length <= 4)
				setRoomPassword(e.currentTarget.value);
		}

		const checkPassword = async (e: React.FormEvent<HTMLFormElement>, chatRoom: ChatRoom) =>
		{
			e.preventDefault();
			try
			{
				axiosInstance.current = await axiosToken();
				const room: AxiosResponse = await axiosInstance.current.get('chatRoom/' + chatRoom.name);

				if (room.data.password.length)
				{
					axiosInstance.current = await axiosToken();
					await axiosInstance.current.post('/chatRoom/checkPassword/' + chatRoom.name,
						{password: roomPassword}, { headers: {"Content-Type": "application/json"}});
					joinRoom(chatRoom.name);
				}
				else
				{
					if (room.data.accessibility === 'PUBLIC')
						joinRoom(chatRoom.name);
					else if (room.data.accessibility === 'PRIVATE')
					{
						setInfoPassword('password removed');
						setRoomPassword('');
					}
				}
			}
			catch (error: any)
			{
				if (error.response.status === 403)
				{
					setInfoPassword('Wrong password');
					setRoomPassword('');
				}
				else
					console.log('error (check password) :', error);
			}
		}

		const displayNotJoinedChatRooms = () =>
		{
			if (!chatRoomsList.length)
				return (<p id="noRoomToJoin">No room to join</p>);
			const printRoomInfo = (chatRoom: ChatRoom) =>
			{
				if (chatRoomSelected === chatRoom.name)
				{
					if (accessibilityAfterSelect.current === 'PROTECTED' ||
					(accessibilityAfterSelect.current === 'PRIVATE' &&
					chatRoom.password !== ''))
					{
							return (<div>
									<form onSubmit={(e) => checkPassword(e, chatRoom)}>
										<label className="joinInfoPassword">{infoPassword}</label>
										<input type="password"
											className ="joinPasswordInput"
											value={roomPassword}
											onChange={updateRoomPassword}
											autoComplete="on"
											/>
									<input type="submit" className="joinSubmitBtn" value="enter"/>
									</form>
								</div>);
					}
					else if (accessibilityAfterSelect.current === 'PRIVATE')
						return (<span>This room is private</span>);
					else if (accessibilityAfterSelect.current === 'PUBLIC')
							joinRoom(chatRoom.name);
				}
				return (	<>
								<p className="owner">Owner : {chatRoom.owner.username}</p>
								{accessibilityLogo(chatRoom.accessibility, chatRoom.password)}
							</>
						);
			}

			const updateSelectChatRoom = async (newChatRoomSelected: string) =>
			{
				try
				{
					if (chatRoomSelected !== newChatRoomSelected)
					{
						setRoomPassword('');
						setInfoPassword('4 digits password : ');
					}
					axiosInstance.current = await axiosToken();
					const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + newChatRoomSelected);
					accessibilityAfterSelect.current = room.data.accessibility;
					setChatRoomSelected(newChatRoomSelected);
				}
				catch (error: any)
				{
					console.log('error (check accessibility after select) :', error);
				}
			}

			return(
				<ul id="roomList">
				{
					chatRoomsList.map((chatRoom) => {
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

		const displayJoinedChatRooms = () =>
		{
			if (!chatRoomsList.length)
				return (<p id="noRoomJoined">You haven't joined any room yet</p>);
			else
				return (
				<ul id="roomList">
				{
					chatRoomsList.map((chatRoom) => {
						return (
							<li className="chatRoom" key={chatRoom.name} onClick={() => enterRoom(chatRoom.name)}>
								<h3 className="roomTitle">{chatRoom.name}</h3>
							</li>
						);
					})
				}
				</ul>
				);
		}

		const displayChatRooms = () =>
		{
			switch (chatRoomFilter)
			{
				case 'NOT_JOINED':
					return (displayNotJoinedChatRooms());
				case 'JOINED':
					return (displayJoinedChatRooms());
			}
		}

	
		useEffect(() =>
		{
			const fetchRooms = async () =>
			{
				try
				{
					let chatRooms: AxiosResponse;
					axiosInstance.current = await axiosToken();
					const user: AxiosResponse = await axiosInstance.current.get('/users/me');
					if (chatRoomFilter === 'JOINED')
					{
						axiosInstance.current = await axiosToken();
						chatRooms = await axiosInstance.current!.get('/chatRoom/joined/' + user.data.id);
					}
					else
					{
						axiosInstance.current = await axiosToken();
						chatRooms = await axiosInstance.current!.get('/chatRoom/notJoined/' + user.data.id);
					}
					setChatRoomsList(chatRooms.data.sort((a: ChatRoom, b: ChatRoom) =>
					(a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)));
				}
				catch (error: any)
				{
					console.log("error while fetching chat rooms: ", error);
				}
			}
			fetchRooms();
		}, [chatRoomFilter]);

		return (
			<div>
				<h3 id="joinRoomTitle">... Or join one !</h3>
				<>
					{filterChatRoom()}
				</>
				<br/>
				<br/>
				<>
					{displayChatRooms()}
				</>
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
