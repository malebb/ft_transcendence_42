import React from 'react';
import { useParams } from 'react-router-dom';
import MessagesContainer from "./containers/Message";
import { useEffect, useRef, useState } from 'react';
import { axiosToken } from '../../api/axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import style from "./ChatRoom.module.css"
import Headers from '../Headers';
import Sidebar from '../Sidebar';
import { RoomStatus } from './utils/RoomStatus';
import { Accessibility } from 'ft_transcendence';
import bcrypt from 'bcryptjs';
import { User } from 'ft_transcendence';

const ChatRoomBase = () =>
{
	const { roomName } = useParams();
	const axiosInstance = useRef<AxiosInstance | null>(null);
	const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const owner = useRef<User | null>(null);
	const [password, setPassword] = useState<string>('');
	const [passwordInfo, setPasswordInfo] = useState("4 digits password : ");
	const [btnValue, setBtnValue] = useState("set");
	const [membersList, setMembersList] = useState<User[]>([]);
	const [admins, setAdmins] = useState<User[]>([]);
	const [leaveRoomInfo, setLeaveRoomInfo] = useState("");
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const regexPassword = useRef(/^[0-9]*$/);

	useEffect(() => {
		const checkRoom = async () =>
		{
			try
			{
				axiosInstance.current = await axiosToken();
				const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);

				if (!room.data)
					setRoomStatus(RoomStatus["NOT_EXIST" as keyof typeof RoomStatus]);
				else
				{
					const member: AxiosResponse = await axiosInstance.current.get('/chatRoom/member/' + roomName);

					if (member.data.members.length)
						setRoomStatus(RoomStatus["JOINED" as keyof typeof RoomStatus])
					else
						setRoomStatus(RoomStatus["NOT_JOINED" as keyof typeof RoomStatus])

				}
			}
			catch (error: any)
			{
				console.log("error: ", error);
			}
		}
		checkRoom();
	}, []);

	useEffect(() => 
	{
		const checkIfOwner = async () =>
		{
			const initPasswordInfo = (room: AxiosResponse) =>
			{
				if (room.data.accessibility === 'PROTECTED' ||
					room.data.accessibility === 'PRIVATE'
					&& room.data.password !== '')
				{
					setPasswordInfo("Change the room password : ");
					setBtnValue("Change");
				}
				else
				{
					setPasswordInfo("Add a password : ");
					setBtnValue("Set");
				}
			}

			try
			{
				axiosInstance.current = await axiosToken();
				const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
				axiosInstance.current = await axiosToken();
				const user: AxiosResponse = await axiosInstance.current.get('/users/me/');
				if (user.data.username == room.data.owner.username)
				{	
					initPasswordInfo(room);
					setIsOwner(true);
				}
				else
					setIsOwner(false);
				setCurrentUser(user.data);
			}
			catch (error: any)
			{
				console.log("error: ", error);
			}
		}
		checkIfOwner();
	}, []);

	const genTitle = () => {
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
		try
		{
			axiosInstance.current = await axiosToken();
			const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
			if (password.length !== 4)
			{
				setPasswordInfo('4 digits required :');
				document.getElementById(style.passwordInfo)!.style.color = 'red';
			}
			else if (await bcrypt.compare(password, room.data.password))
			{
				setPasswordInfo('The password is not new :');
				document.getElementById(style.passwordInfo)!.style.color = 'red';
			}
			else
			{
				const salt = await bcrypt.genSalt(10);
				const passwordHashed: string = await bcrypt.hash(password, salt);

				axiosInstance.current = await axiosToken();
				await axiosInstance.current.patch('/chatRoom/password/' + roomName, "password=" + passwordHashed);
				if (room.data.accessibility === 'PUBLIC')
				{
					axiosInstance.current = await axiosToken();
					await axiosInstance.current.patch('/chatRoom/changeAccessibility/' + roomName, "accessibility=PROTECTED");
				}
				setPasswordInfo('Change the room password: ');
				setBtnValue("Change password");
				setPassword('');
				document.getElementById(style.passwordInfo)!.style.color = 'white';
				alert('Password updated successfully!');
				return ;
			}
			return ;
		}
		catch (error: any)
		{
			console.log("error: ", error);
		}
	}

	const handleRemovePassword = async (e: React.FormEvent<HTMLFormElement>) =>
	{
		e.preventDefault();
		try
		{
			axiosInstance.current = await axiosToken();
			const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
			if (room.data.password === '')
			{
				setPasswordInfo('No password to remove');
				document.getElementById(style.passwordInfo)!.style.color = 'red';
				return ;
			}
			axiosInstance.current = await axiosToken();
			await axiosInstance.current.patch('/chatRoom/removePassword/' + roomName);
			if (room.data.accessibility === 'PROTECTED')
			{
				axiosInstance.current = await axiosToken();
				await axiosInstance.current.patch('/chatRoom/changeAccessibility/' + roomName, "accessibility=PUBLIC");
			}
			window.location.reload();
			alert('Password removed successfully');
		}
		catch (error: any)
		{
			console.log("error: ", error);
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
				isOwner ? (
				<>
					<form onSubmit={handleChangePassword} id={style.passwordForm}>
					<label id={style.passwordInfo}>{passwordInfo}</label>
						<input type="password"
								onChange={updatePassword}
								autoComplete="on"
								value={password}
								className={style.passwordInput}
						/>
						<input type="submit" value={btnValue}
						className={style.passwordSubmitBtn}/>
					</form> 
					<form onSubmit={handleRemovePassword} className={style.removePassword}>
						<input type="submit" value="remove password"
							className={style.passwordSubmitBtn}/>
					</form>
				</>

				) : <></>
			);
	}

	const handleMembersDisplay = async () =>
	{
		try
		{
			let members: HTMLElement = document.getElementById(style.members)!;
			let membersDisplay = window.getComputedStyle(members).getPropertyValue('display');

			if (membersDisplay === "none")
			{
				members.style.display = "block";
			}
			else
				members.style.display = "none";
			axiosInstance.current = await axiosToken();
			const room = await axiosInstance.current.get('/chatRoom/' + roomName);
			owner.current = room.data.owner;
			setAdmins(room.data.admins);
			setMembersList(room.data.members);
			axiosInstance.current = await axiosToken();

			const user = await axiosInstance.current.get('/users/me');
			if (user.data.email === owner.current!.email)
			{
				setIsOwner(true);
			}

		}
		catch (error: any)
		{
			console.log("error: ", error);
		}
	}

	const makeOwner = async (member: User) =>
	{
		try
		{
			axiosInstance.current = await axiosToken();
			axiosInstance.current.patch('/chatRoom/changeOwner/' + roomName, {username: member.username});
			alert(member.username + " is the new owner");
			window.location.reload();
		}
		catch (error: any)
		{
			console.log("error: ", error);
		}
	}

	const makeOwnerLogo = (member: User) =>
	{
		return (isOwner ? 
		(
			owner.current!.email !== member.email ?
			<img className={style.makeOwner} src="http://localhost:3000/images/makeOwner.png" 
			alt="make Owner" title="make owner"
			width="20" height="20"
			onClick={() => makeOwner(member)}/> : <></>
		)
		: <></>);
	}

	const makeAdmin = async (member: User) =>
	{
		try
		{
			axiosInstance.current = await axiosToken();
			await axiosInstance.current.patch('/chatRoom/addAdmin/' + roomName, "username=" + member.username);
			window.location.reload();
		}
		catch (error: any)
		{
			console.log("error: ", error);
		}
	}

	const isAdmin = (member: User) : boolean =>
	{
		for(var i: number = 0; i < admins.length; ++i)
		{
			if (admins[i].email === member.email)
			{
				return (true);
			}
		}
		return (false);
	}

	const makeAdminLogo = (member: User) =>
	{
		return (!isAdmin(member) && (isOwner || isAdmin(currentUser!))? 
			<img className={style.makeAdmin} src="http://localhost:3000/images/admin.png" 
			alt="make Admin" title="make admin"
			width="20"
			onClick={() => makeAdmin(member)}/> : <></>
		 );
	}

	const printRole = (member: User) =>
	{
		if (owner.current!.email === member.email)
			return (<span>(owner)</span>);
		else if (isAdmin(member))
			return (<span>(admin)</span>);
		else
			return (<span>(member)</span>);
	}

	const memberList = () =>
	{
		return (
			<ul id={style.memberList}>
				<li>
					<h4 className={style.membersTitle} onClick={handleMembersDisplay}>Members</h4>
					<ul id={style.members} >
						{membersList.map((member: User) => {
							return (
								<li className={currentUser && currentUser.email
								!== member.email ? style.member : 
								style.currentMember} key={member.email}>
									{member.username}
									{printRole(member)}
									{makeOwnerLogo(member)}
									{makeAdminLogo(member)}
								</li>
							);
						})}
					</ul>
				</li>
			</ul>
		);
	}

	const handleLeaveRoom = async (e: React.FormEvent<HTMLFormElement>) =>
	{
		e.preventDefault();
		try
		{
			axiosInstance.current = await axiosToken();
			const user = await axiosInstance.current.get('/users/me');
			axiosInstance.current = await axiosToken();
			const room = await axiosInstance.current.get('/chatRoom/' + roomName);
			if (user.data.email !== room.data.owner.email)
			{
				axiosInstance.current.patch('/chatRoom/leaveRoom/' + roomName);
				window.location.href = 'http://localhost:3000/chat/';
			}
			else
			{
				setLeaveRoomInfo('make someone owner to leave');
			}
		}
		catch (error: any)
		{
			
		}
	}

	const leaveBtn = () =>
	{
		return (
			<div id={style.leaveRoom}>
				<form onSubmit={handleLeaveRoom}>
					<label id={style.leaveRoomInfo}>{leaveRoomInfo}</label>
					<input type="submit" value="leave room"
					className={style.leaveBtn}/>
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
					{leaveBtn()}
					{passwordSection()}
				</div>
				<div className={style.chat}>
						<MessagesContainer />
				</div>
			</>
			);
		}
		else if (roomStatus === 'NOT_JOINED')
		{
			return (<p id={style.roomStatus}>You are not a member of {roomName} room</p>);
		}
		else if (roomStatus == 'NOT_EXIST')
		{
			return (<p id={style.roomStatus}>Room {roomName} does not exist</p>);
		}
		else if (!roomStatus)
		{
			return (<p id={style.roomStatus}>loading...</p>);
		}
	}

	return (
	<>
	{/*
		<Headers/>
		<Sidebar/> */}
		<div className={style.roomBase}>
		{checkRoomStatus()}
		</div>
	</>
	);
};

export default ChatRoomBase;
