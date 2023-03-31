import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import MessagesContainer from "./containers/Message";
import { useEffect, useRef, useState, useCallback } from 'react';
import { axiosToken, getToken } from '../../api/axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import style from "./ChatRoom.module.css"
import Headers from 'src/components/Headers';
import Sidebar from 'src/components/Sidebar';
import { RoomStatus } from './utils/RoomStatus';
import { User, PenaltyType, MessageType } from 'ft_transcendence';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import alertStyle from '../../styles/alertBox.module.css';
import { trimUsername } from '../../utils/trim';
import useAxiosPrivate from 'src/hooks/usePrivate';
import { printInfosBox } from '../../utils/infosBox';
import { Socket, io } from "socket.io-client";
import AuthContext from 'src/context/TokenContext';

const ChatRoomBase = () =>
{

	const axiosPrivate = useAxiosPrivate();
	const { token } = useContext(AuthContext);
	const { roomName } = useParams();
	const axiosInstance = useRef<AxiosInstance | null>(null);
	const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
	const [password, setPassword] = useState<string>('');
	const [passwordInfo, setPasswordInfo] = useState("4 digits password : ");
	const [btnValue, setBtnValue] = useState("set");
	const regexPassword = useRef(/^[0-9]*$/);
	const [isCurrentUserOwner, setIsCurrentUserOwner] = useState<boolean>(false);
	const socket = useRef<Socket | null>(null);
	const roomStatusInterval = useRef<ReturnType<typeof setInterval>>();

	// members list data :
	const [membersMuted, setMembersMuted] = useState<User[]>([]);
	const [members, setMembers] = useState<User[]>([]);
	const [owner, setOwner] = useState<User | null>(null);
	const [admins, setAdmins] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	const updateRoomStatus = useCallback(async () =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			const room = await axiosInstance.current.get('/chatRoom/publicInfos/' + roomName);
			if (room.data)
			{
				const ban: AxiosResponse = await axiosInstance.current.get('/chatRoom/myBan/' + roomName);
				if (ban.data.penalties.length)
					setRoomStatus(RoomStatus["BANNED" as keyof typeof RoomStatus]);
				// const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
				// const user: AxiosResponse = await axiosInstance.current.get('/users/me');
				// setCurrentUser(user.data);
				if (!room.data)
					setRoomStatus(RoomStatus["NOT_EXIST" as keyof typeof RoomStatus]);
				else
				{
					const member = await axiosInstance.current.get('/chatRoom/member/' + roomName);
					if (!member.data.length)
					{
						setRoomStatus(RoomStatus["NOT_JOINED" as keyof typeof RoomStatus])
					}
					else
					{
						setRoomStatus(RoomStatus["JOINED" as keyof typeof RoomStatus])
					}
				}
			}
			else
				setRoomStatus(RoomStatus["NOT_EXIST" as keyof typeof RoomStatus])

		}
		catch (error: any)
		{
			console.log('error (update room status): ', error);
		}
	}, [roomName]);

	const updateMembersData = useCallback(async () =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			const room = await axiosInstance.current.get('/chatRoom/publicInfos/' + roomName);
			axiosInstance.current = axiosPrivate;
			const user = await axiosInstance.current.get('/users/me');
			axiosInstance.current = axiosPrivate;
			const userMuted: AxiosResponse = await axiosInstance.current.get('/chatRoom/mutedMembers/' + roomName);

			setOwner(room.data.owner);
			if (user.data.id === room.data.owner.id)
			{	
				initPasswordInfo(room);
				setIsCurrentUserOwner(true);
			}
			else
				setIsCurrentUserOwner(false);

			setAdmins(room.data.admins);
			setMembers(room.data.members);
			setCurrentUser(user.data);
			setMembersMuted(userMuted.data);
			updateRoomStatus();
		}
		catch (error: any)
		{
			if (error.response.status === 403)
				updateRoomStatus();
			else
				console.log('error (update members list data) :', error);
		}
	}, [updateRoomStatus, roomName]);

	useEffect(() => 
	{
		const handleRoomStatus = async () =>
		{
			await updateRoomStatus();
			roomStatusInterval.current = setInterval(async () => {
				try
				{
					axiosInstance.current = axiosPrivate;
					const response: AxiosResponse = await axiosInstance.current.get('/chatRoom/member/' + roomName);
					if (!response.data.length)
					{
						clearInterval(roomStatusInterval.current!);
						await updateRoomStatus();
					}
				}
				catch (error: any)
				{
					console.log('error: ', error);
				}
			}, 2000)
		}
		handleRoomStatus();
		return () => {
				clearInterval(roomStatusInterval.current!);
		}
	}, [updateRoomStatus, roomName]);

	useEffect(() =>
	{
		const checkIfOwner = async () =>
		{
			try
			{
				// axiosInstance.current = axiosPrivate;
				// const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
				axiosInstance.current = axiosPrivate;
				const user: AxiosResponse = await axiosInstance.current.get('/users/me/');
				setCurrentUser(user.data);
				updateMembersData();
			}
			catch (error: any)
			{
				console.log("error (check owner) :", error);
			}
		}
		checkIfOwner();
	}, [roomName, updateMembersData]);

	const genTitle = () =>
	{
		return (
			<div className={style.title}>
				<h1 className={style.logo}>{roomName}</h1>
				<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
					<path fill="#413368" d="M37.7,-48.2C52.8,-41,71.7,-35.2,78.9,-23.2C86.1,-11.3,81.6,6.9,71.8,19.2C62.1,31.4,47.1,37.8,34.2,45.1C21.4,52.4,10.7,60.7,-0.1,60.9C-11,61,-21.9,53.1,-36.1,46.2C-50.2,39.3,-67.6,33.5,-75.2,21.7C-82.8,9.9,-80.7,-7.8,-73.8,-22.3C-66.8,-36.8,-54.9,-48,-41.8,-55.8C-28.7,-63.7,-14.3,-68.2,-1.5,-66.1C11.3,-64,22.6,-55.4,37.7,-48.2Z" transform="translate(100 100)" />
				</svg>
			</div>
		)
	}

	const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) =>
	{
		e.preventDefault();
		if (password.length !== 4)
		{
			setPasswordInfo('4 digits required :');
			document.getElementById(style.passwordInfo)!.style.color = 'red';
			return;
		}
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.post('/chatRoom/checkPassword/' + roomName, "password=" + password);
			setPasswordInfo('The password is not new :');
			document.getElementById(style.passwordInfo)!.style.color = 'red';
			return ;
		}
		catch (error: any) { }
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/password/' + roomName, {password: password},
			{headers: {"Content-type": "application/json"}});
			printInfosBox('Password updated successfully');
			setPasswordInfo('Change the room password: ');
			setBtnValue("Change password");
			setPassword('');
			document.getElementById(style.passwordInfo)!.style.color = 'white';
		}
		catch (error: any)
		{
			if (error.response.status === 403)
				printInfosBox('You can not change the password');

			console.log('error (changing password)', error);
		}
	}

	const handleRemovePassword = async (e: React.FormEvent<HTMLFormElement>) =>
	{
		e.preventDefault();
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/removePassword/' + roomName);
			document.getElementById(style.passwordInfo)!.style.color = 'white';
			printInfosBox('Password has been removed successfully');
			setPasswordInfo('Add a password: ');
			setBtnValue("set");
			setPassword('');
		}
		catch (error: any)
		{
			if (error.response.status === 403)
				printInfosBox('You can not remove the password');
			else
				console.log("error (remove password) :", error);
		}
	}

	const updatePassword = (e: React.FormEvent<HTMLInputElement>) =>
	{
		if (regexPassword.current.test(e.currentTarget.value) && e.currentTarget.value.length <= 4)
			setPassword(e.currentTarget.value);
		if (!regexPassword.current.test(e.currentTarget.value))
		{
			setPasswordInfo('only digits :');
			document.getElementById(style.passwordInfo)!.style.color = 'red';
		}
	}

	const passwordSection = () =>
	{
		return (
			isCurrentUserOwner ? (
				<div id={style.chatPassword}>
					<form onSubmit={handleChangePassword} className={style.passwordForm} id="passwordForm">
						<label id={style.passwordInfo}>{passwordInfo}</label>
						<input type="password"
							onChange={updatePassword}
							autoComplete="on"
							value={password}
							className={style.passwordInput}
						/>
						<input type="submit" value={btnValue}
							className={style.passwordSubmitBtn} />
					</form>
					<form onSubmit={handleRemovePassword} className={style.removePassword}>
						<input type="submit" value="Remove password"
							className={style.passwordSubmitBtn} />
					</form>
				</div>

			) : <></>
		);
	}

	const isMemberMuted = (member: User) =>
	{
		for (let i = 0; i < membersMuted!.length; ++i)
		{
			if (member.id === membersMuted![i].id)
				return (true);
		}
		return (false);
	}

	const isAdmin = (member: User): boolean =>
	{
		for (let i: number = 0; i < admins.length; ++i) {
			if (admins[i].id === member.id) {
				return (true);
			}
		}
		return (false);
	}

	const isOwner = (member: User): boolean =>
	{
		return (member.id === owner!.id);
	}

	const isYourself = (member: User): boolean =>
	{
		return (member!.id === currentUser!.id)
	}

	const initPasswordInfo = (room: AxiosResponse) =>
	{
		if (room.data.accessibility === 'PROTECTED' ||
			room.data.accessibility === 'PRIVATE_PROTECTED') {
			setPasswordInfo("Change the room password : ");
			setBtnValue("Change");
		}
		else
		{
			setPasswordInfo("Add a password : ");
			setBtnValue("set");
		}
	}

	const makeOwner = async (member: User) =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/makeOwner/' + roomName, { userId: member.id });
			printInfosBox(member.username + ' is the new owner');
			await updateMembersData();
		}
		catch (error: any)
		{
			if (error.response.status === 403)
			{
				printInfosBox('You can not make ' + member.username + " owner");
				await updateMembersData();
			}
			else
				console.log("error (make owner) :", error);
		}
	}

	const makeOwnerLogo = (member: User) =>
	{
		return (isOwner(currentUser!) ? (
			owner!.id !== member.id ?
				<img className={style.memberAction} src="http://localhost:3000/images/makeOwner.png"
					alt="Make Owner" title="Make owner"
					width="20" height="20"
					onClick={() => makeOwner(member)} /> : <></>) : (<></>));
	}

	const makeAdmin = async (member: User) =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/makeAdmin/' + roomName, "userId=" + member.id);
			printInfosBox(member.username + ' is now admin');
			await updateMembersData();
		}
		catch (error: any)
		{
			if (error.response.status === 403)
			{
				printInfosBox('You can not make ' + member.username + " admin");
				await updateMembersData();
			}
			else
				console.log("error (make admin) :", error);
		}
	}

	const makeAdminLogo = (member: User) =>
	{
		return (!isAdmin(member) && isOwner(currentUser!) ?
			<img className={style.memberAction} src="http://localhost:3000/images/admin.png"
				alt="Make admin" title="Make admin"
				width="20" height="21"
				onClick={() => makeAdmin(member)} /> : <></>
		);
	}

	const printRole = (member: User) =>
	{
		if (owner!.id === member.id)
			return (<span className={style.role}>(owner)</span>);
		else if (isAdmin(member))
			return (<span className={style.role}>(admin)</span>);
		else
			return (<span className={style.role}>(member)</span>);
	}

	const removeAdmin = async (member: User) =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/removeAdmin/' + roomName, "userId=" + member.id);
			printInfosBox(member.username + ' is no longer admin');
			await updateMembersData();
		}
		catch (error: any)
		{
			if (error.response.status === 403)
			{
				printInfosBox('You can not remove admin role from ' + member.username);
				await updateMembersData();
			}
			else
				console.log("error (remove admin) :", error);
		}
	}

	const removeAdminLogo = (member: User) =>
	{
		return (isOwner(currentUser!) && isAdmin(member) && owner!.id !== member.id ?
			<img className={style.memberAction} src="http://localhost:3000/images/removeAdmin.png"
				alt="Remove admin" title="Remove admin"
				width="20"
				onClick={() => removeAdmin(member)} /> : <></>
		);
	}

	const challenge = async (member: User, powerUpMode: boolean) =>
	{
      	socket.current = io("ws://localhost:3333/chat", {
       		transports: ["websocket"],
     		forceNew: true,
       		upgrade: false,
			auth: {
				token: token!.access_token
			}
      	});
      	socket.current!.on("connect", async () =>
		{
			try
			{
				axiosInstance.current = axiosPrivate;
				const challengeResponse = await axiosInstance.current.post('/challenge/', { powerUpMode: powerUpMode, receiverId: member.id },
				{
					headers:
					{
						"Content-Type": "application/json"
					}
				});
        		socket.current?.emit("JOIN_PRIVATE_ROOM", {
          			senderId: currentUser!.id,
          			receiverId: member!.id,
		        });
        		const joinRoom = async (): Promise<object> => {
         			return await new Promise(function (resolve) {
          				socket.current!.on("GET_ROOM", async (data) => {
              				resolve(data);
            			});
          			});
        		};
        		joinRoom().then(function (data) {
					const room = data;
    				socket.current!.emit("SEND_PRIVATE_ROOM_MESSAGE", {
  					    msg: {user: currentUser, message: "Join me for a game !", sendAt: new Date(), type: "INVITATION", challengeId: challengeResponse.data},
     					room: room,
      					senderId: currentUser!.id,
      					receiverId: member.id,
						type: MessageType["INVITATION" as keyof typeof MessageType]
    				});
					socket.current!.disconnect();
					window.location.href = 'http://localhost:3000/challenge/' + challengeResponse.data;
        		});
			}
			catch (error: any)
			{
				if (error.response.status === 403)
				{
					printInfosBox('You are already playing in another game');
					await updateMembersData();
				}
			}
		});
	}

	const selectMode = (member: User) =>
	{
		confirmAlert({
			customUI: ({ onClose }) =>
			{
				return (
					<div id={alertStyle.boxContainer}>
						<h1>Challenge {trimUsername(member.username, 15)}</h1>
						<p>Select a pong mode</p>
						<div id={alertStyle.alertBoxBtn}>
							<button onClick={() =>
							{
								challenge(member, false);
								onClose();
							}}>normal</button>
							<button onClick={() =>
							{
								challenge(member, true)
								onClose();
							}}>power-up</button>
						</div>
					</div>);
			},
			keyCodeForClose: [8, 32, 13],

		});
	}

	const challengeLogo = (member: User) =>
	{
		return (!isYourself(member) ?
			<img className={style.memberAction} src="http://localhost:3000/images/challenge.png"
				alt={"Challenge" + member.username} title={"Challenge " + member.username}
				width="20" height="22"
				onClick={() => selectMode(member)} /> : <></>
		);
	}

	const kick = async (member: User) =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/kick/' + roomName, { userId: member.id });
			printInfosBox(member.username + ' has been kicked');
			await updateMembersData();
		}
		catch (error: any)
		{
			if (error.response.status === 403) {
				printInfosBox('You can not kick ' + member.username);
				await updateMembersData();
			}
			else
				console.log('error (while kicking) :', error);
		}
	}

	const kickLogo = (member: User) =>
	{
		return (isAdmin(currentUser!) && !isYourself(member) && !isOwner(member) ? (
			<img className={style.memberAction} src="http://localhost:3000/images/kick.png"
				alt={"Kick" + member.username} title={"Kick " + member.username}
				width="20" height="21"
				onClick={() => kick(member)} />) : (<></>));
	}

	const applyPenalty = async (member: User, duration: number, type: PenaltyType) =>
	{
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.post('/chatRoom/penalty/' + roomName,
				{
					type: type,
					targetId: member.id,
					roomName: roomName,
					durationInMin: duration
				},
				{
					headers:
					{
						"Content-Type": "application/json"
					}
				});
			switch (type)
			{
				case 'BAN':
					printInfosBox(member.username + ' has been banned');
					break;
				case 'MUTE':
					printInfosBox(member.username + ' has been muted');
					break;
			}
			await updateMembersData();
		}
		catch (error: any)
		{
			if (error.response.status === 403)
			{
				switch (type) {
					case 'BAN':
						printInfosBox('You can not ban ' + member.username);
						break;
					case 'MUTE':
						printInfosBox('You can not mute ' + member.username);
						break;
				}
				await updateMembersData();
			}
			else
				console.log("error (apply penalty) :", error);
		}
	}

	const selectPenaltyTime = (member: User, type: PenaltyType) =>
	{
		confirmAlert(
			{
				customUI: ({ onClose }) =>
				{
					return (
						<div id={alertStyle.boxContainer}>
							<h1>{type.charAt(0).toUpperCase() + type.toLowerCase().slice(1)} {trimUsername(member.username, 15)}</h1>
							<p>Select duration</p>
							<div id={alertStyle.alertBoxBtn}>
								<button onClick={() => { applyPenalty(member, 1, type); onClose() }}>1 min</button>
								<button onClick={() => { applyPenalty(member, 15, type); onClose() }}>15 min</button>
								<button onClick={() => { applyPenalty(member, 60, type); onClose() }}>1 hour</button>
								<button onClick={() => { applyPenalty(member, 360, type); onClose() }}>6 hours</button>
								<button onClick={() => { applyPenalty(member, 1440, type); onClose() }}>1 day</button>
								<button onClick={() => { applyPenalty(member, 10080, type); onClose() }}>1 week</button>
							</div>
						</div>
					);
				},
				keyCodeForClose: [8, 32, 13]
			});
	}

	const banLogo = (member: User) =>
	{
		return (isAdmin(currentUser!) && currentUser!.id !== member.id && member.id !== owner!.id ?
			<img className={style.memberAction} src="http://localhost:3000/images/ban.png"
				alt={"Ban " + member.username} title={"Ban " + member.username}
				width="22" height="22"
				onClick={() => selectPenaltyTime(member, PenaltyType["BAN" as keyof typeof PenaltyType])} /> : <></>
		);
	}

	const muteLogo = (member: User) =>
	{
		return (isAdmin(currentUser!) && currentUser!.id !== member.id && member.id !== owner!.id &&
			!isMemberMuted(member) ?
			<img className={style.memberAction} src="http://localhost:3000/images/mute.png"
				alt={"Mute " + member.username} title={"Mute " + member.username}
				width="22" height="22"
				onClick={() => selectPenaltyTime(member, PenaltyType["MUTE" as keyof typeof PenaltyType])} /> : <></>
		);
	}

	const handleMembersDisplay = async () =>
	{
		try
		{
			await updateMembersData();
			let members: HTMLElement = document.getElementById(style.members)!;
			let membersDisplay = window.getComputedStyle(members).getPropertyValue('display');

			if (membersDisplay === "none")
				members.style.display = "block";
			else
				members.style.display = "none";
		}
		catch (error: any)
		{
			console.log("error (display members) :", error);
		}
	}

	const memberList = () =>
	{
		return (
			<ul id={style.memberList}>
				<li>
					<h4 className={style.membersTitle} onClick={handleMembersDisplay}>Members</h4>
					<ul id={style.members} >
						{members.map((member: User) =>
						{
							return (
								<li className={currentUser && currentUser.id
									!== member.id ? style.member :
									style.currentMember} key={member.id}>
									<div id={style.nameAndRole}>
										<a className={style.link_user} href={"/user/" + member.id} >
											{trimUsername(member.username, 16)}
										</a>
										{printRole(member)}
									</div>
									<div id={style.memberActions}>
										{makeOwnerLogo(member)}
										{makeAdminLogo(member)}
										{removeAdminLogo(member)}
										{challengeLogo(member)}
										{muteLogo(member)}
										{banLogo(member)}
										{kickLogo(member)}
									</div>
								</li>
							);
						})}
					</ul>
				</li>
			</ul>
		);
	}

	const handleLeaveRoom = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try
		{
			axiosInstance.current = axiosPrivate;
			await axiosInstance.current.patch('/chatRoom/leaveRoom/' + roomName);
			window.location.href = 'http://localhost:3000/chat/';
		}
		catch (error: any)
		{
			if (error.response.status === 403)
			{
				printInfosBox('You can not leave the room');
				await updateMembersData();
			}
			else
				console.log('error (leave room) :', error);
		}
	}

	const leaveBtn = () =>
	{
		return (
			<div id={style.leaveRoom}>
				<form onSubmit={handleLeaveRoom}>
					<input type="submit" value="Leave room"
						className={style.leaveBtn} />
				</form>
			</div>
		);
	}

	const checkRoomStatus = () =>
	{
		if (roomStatus === 'JOINED')
		{
			return (
				<>
					{genTitle()}
					<div id={style.chatDataSection}>
						{memberList()}
						<div id={style.chatSettings}>
							{leaveBtn()}
							{passwordSection()}
						</div>
					</div>
					<div className={style.chat}>
						<MessagesContainer />
					</div>
				</>
			);
		}
		else if (roomStatus === 'NOT_JOINED')
		{
			return (
				<div id={style.roomStatusContainer}>
					<p id={style.roomStatusMsg}>You are not a member of '{roomName}'</p>
					<Link id={style.roomStatusBtn} to={`/chat/`}>rooms</Link>
				</div>);
		}
		else if (roomStatus === 'NOT_EXIST')
		{
			return (
				<div id={style.roomStatusContainer}>
					<p id={style.roomStatusMsg}>Room '{roomName}' does not exist</p>
					<Link id={style.roomStatusBtn} to={`/chat/`}>rooms</Link>
				</div>);
		}
		else if (roomStatus === 'BANNED')
		{
			return (
				<div id={style.roomStatusContainer}>
					<p id={style.roomStatusMsg}>You have been temporarily banned from '{roomName}', try later</p>
					<Link id={style.roomStatusBtn} to={`/chat/`}>rooms</Link>
				</div>
			);
		}
		else if (!roomStatus)
		{
			return (<p id={style.roomStatus}>loading...</p>);
		}
	}

	return (
		<>
			<Headers />
			<Sidebar />
			<div className={style.roomBase}>
				{checkRoomStatus()}
			</div>
		</>
	);
};

export default ChatRoomBase;
