import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MessagesContainer from "./containers/Message";
import { useEffect, useRef, useState } from 'react';
import { axiosToken } from '../../api/axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import style from "./ChatRoom.module.css"
import Headers from '../Headers';
import Sidebar from '../Sidebar';
import { RoomStatus } from './utils/RoomStatus';
import { Penalty } from './utils/Penalty';
import { User, PenaltyType } from 'ft_transcendence';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import alertStyle from './alertBox.module.css';

const ChatRoomBase = () =>
{
	const { roomName } = useParams();
	const axiosInstance = useRef<AxiosInstance | null>(null);
	const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const [membersMuted, setMembersMuted] = useState<User[]>([]);
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
				axiosInstance.current = await axiosToken();
				const user: AxiosResponse = await axiosInstance.current.get('/users/me');
				setCurrentUser(user.data);
				if (!room.data)
					setRoomStatus(RoomStatus["NOT_EXIST" as keyof typeof RoomStatus]);
				else
					isUserStillMember(user.data.id);
			}
			catch (error: any)
			{
				console.log("error (check room) :", error);
			}
		}
		checkRoom();
	}, [roomName]);

	useEffect(() => 
	{
		const checkIfOwner = async () =>
		{
			const initPasswordInfo = (room: AxiosResponse) =>
			{
				if (room.data.accessibility === 'PROTECTED' ||
					(room.data.accessibility === 'PRIVATE'
					&& room.data.password !== ''))
				{
					setPasswordInfo("Change the room password : ");
					setBtnValue("Change");
				}
				else
				{
					setPasswordInfo("Add a password : ");
					setBtnValue("set");
				}
			}

			try
			{
				axiosInstance.current = await axiosToken();
				const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
				axiosInstance.current = await axiosToken();
				const user: AxiosResponse = await axiosInstance.current.get('/users/me/');
				if (user.data.username === room.data.owner.username)
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
				console.log("error (check owner) :", error);
			}
		}
		checkIfOwner();
	}, [roomName]);

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

	const printInfosBox = (infos: string) =>
	{
	 	confirmAlert({
   		customUI: ({onClose}) =>
		{
			return (
					<div id={alertStyle.boxContainer} onClick={() => onClose()} style={{width: 400}}>
						<h2>{infos}</h2>
						<div id={alertStyle.alertBoxBtn}>
							<p>Click to continue</p>
						</div>
					</div>
				   );
		}
		});
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
				return;
			}
			try
			{
				if (room.data.accessibility === 'PROTECTED'
				|| (room.data.accessibility === 'PRIVATE' && room.data.password.length))
				{
					axiosInstance.current = await axiosToken();
					await axiosInstance.current.post('/chatRoom/checkPassword/' + roomName,
						{password: password}, { headers: {"Content-Type": "application/json"}});
					setPasswordInfo('The password is not new :');
					document.getElementById(style.passwordInfo)!.style.color = 'red';
					return ;
				}
			}
			catch (error: any) {}
			axiosInstance.current = await axiosToken();
			await axiosInstance.current.patch('/chatRoom/password/' + roomName, "password=" + password);
			if (room.data.accessibility === 'PUBLIC')
			{
				axiosInstance.current = await axiosToken();
				await axiosInstance.current.patch('/chatRoom/changeAccessibility/' + roomName, "accessibility=PROTECTED");
			}
			setPasswordInfo('Change the room password: ');
			setBtnValue("Change password");
			setPassword('');
			document.getElementById(style.passwordInfo)!.style.color = 'white';
			printInfosBox('Password updated successfully');
			return ;
		}
		catch (error: any)
		{
			console.log("error (change password) :", error);
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
			document.getElementById(style.passwordInfo)!.style.color = 'white';
			setPasswordInfo('Add a password: ');
			setBtnValue("set");
			setPassword('');
			printInfosBox('Password has been removed successfully');
		}
		catch (error: any)
		{
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
				isOwner ? (
				<div id={style.chatPassword}>
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

	const handleMembersDisplay = async () =>
	{
		try
		{
			isUserStillMember(currentUser!.id).then(async (ret: boolean) =>
			{
				if (ret)
				{
					let members: HTMLElement = document.getElementById(style.members)!;
					let membersDisplay = window.getComputedStyle(members).getPropertyValue('display');
	
					if (membersDisplay === "none")
						members.style.display = "block";
					else
						members.style.display = "none";
					axiosInstance.current = await axiosToken();
					const room = await axiosInstance.current.get('/chatRoom/' + roomName);
					owner.current = room.data.owner;
					setAdmins(room.data.admins);
					setMembersList(room.data.members);
					axiosInstance.current = await axiosToken();
					const user = await axiosInstance.current.get('/users/me');
					setCurrentUser(user.data);
					if (user.data.id === owner.current!.id)
					{
						setIsOwner(true);
					}
					axiosInstance.current = await axiosToken();
					const getMutes: AxiosResponse = await axiosInstance.current.get('/chatRoom/mutes/' + roomName);
					const selectMuted: User [] = [];
					for (let i = 0; i < getMutes.data.penalties.length; ++i)
					{
						selectMuted.push(getMutes.data.penalties[i].target);
					}
					setMembersMuted(selectMuted);
				}

			});
		}
		catch (error: any)
		{
			console.log("error (display members) :", error);
		}
	}

	const makeOwner = async (member: User) =>
	{
		try
		{
			isCurrentUserOwner().then(async (ret: boolean) =>
			{
				if (ret)
				{
					await isUserStillMember(member.id).then(async (ret: boolean) =>
					{
						if (ret)
						{
							axiosInstance.current = await axiosToken();
							axiosInstance.current.patch('/chatRoom/changeOwner/' + roomName, {userId: member.id});
							owner.current = member;
							setIsOwner(false);
							printInfosBox(member.username + ' is the new owner');
						}
						else
						{
							printInfosBox(member.username + ' is not member anymore');
							removeMemberFromList(member);
						}
					});
				}
				else
					printInfosBox('You are not owner anymore');
			});
		}
		catch (error: any)
		{
			console.log("error (make owner) :", error);
		}
	}

	const makeOwnerLogo = (member: User) =>
	{
		return (isOwner ? 
		(
			owner.current!.id !== member.id ?
			<img className={style.memberAction} src="http://localhost:3000/images/makeOwner.png" 
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
			isCurrentUserOwner().then(async (ret: boolean) =>
			{
				if (ret)
				{
					isUserStillMember(member.id).then(async (ret: boolean) =>
					{
						if (ret)
						{
							axiosInstance.current = await axiosToken();
							await axiosInstance.current.patch('/chatRoom/addAdmin/' + roomName, "userId=" + member.id);
							printInfosBox(member.username + ' is now admin');
							const newAdmins: User[] = [...admins];
							newAdmins.push(member);
							setAdmins(newAdmins);
						}
						else
						{
							printInfosBox(member.username + ' is not member anymore');
							removeMemberFromList(member);
						}
					});
				}
			});
		}
		catch (error: any)
		{
			console.log("error (make admin) :", error);
		}
	}

	const isAdmin = (member: User) : boolean =>
	{
		for(var i: number = 0; i < admins.length; ++i)
		{
			if (admins[i].id === member.id)
			{
				return (true);
			}
		}
		return (false);
	}

	const makeAdminLogo = (member: User) =>
	{
		return (!isAdmin(member) && isOwner ?
			<img className={style.memberAction} src="http://localhost:3000/images/admin.png" 
			alt="make admin" title="make admin"
			width="20"
			onClick={() => makeAdmin(member)}/> : <></>
		 );
	}

	const printRole = (member: User) =>
	{
		if (owner.current!.id === member.id)
			return (<span className={style.role}>(owner)</span>);
		else if (isAdmin(member))
			return (<span className={style.role}>(admin)</span>);
		else
			return (<span className={style.role}>(member)</span>);
	}

	const isCurrentUserOwner = async (): Promise<boolean> =>
	{
		try
		{
			axiosInstance.current = await axiosToken();
			const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
			if (currentUser!.id === room.data.owner.id)
				return (new Promise(resolve => {resolve(true)}));
			return (new Promise(resolve => {resolve(false)}));
		}
		catch (error: any)
		{
			console.log('error (checking if current user is owner) :', error);
			return (new Promise(resolve => {resolve(false)}));
		}
	}

	const removeAdmin = async (member: User) =>
	{
		try
		{
			isCurrentUserOwner().then(async (ret: boolean) =>
			{
				if (ret)
				{
					isUserStillMember(member.id).then(async (ret: boolean) =>
					{
						if (ret)
						{
							axiosInstance.current = await axiosToken();
							await axiosInstance.current.patch('/chatRoom/removeAdmin/' + roomName, "userId=" + member.id);
							printInfosBox(member.username + ' is not admin anymore');
							for (let i = 0; i < admins.length; ++i)
							{
								if (member.id === admins[i].id)
								{
									let newAdmins: User[] = [...admins];
									newAdmins.splice(i, 1);
									setAdmins(newAdmins);
								}
							}
						}
						else
						{
							printInfosBox(member.username + ' is not member anymore');
							removeMemberFromList(member);
						}
					});
				}
			});
		}
		catch (error: any)
		{
			console.log("error (remove admin): ", error);
		}
	}

	const removeAdminLogo = (member: User) =>
	{
		return (isOwner && isAdmin(member) && owner.current!.id !== member.id ? 
			<img className={style.memberAction} src="http://localhost:3000/images/removeAdmin.png" 
			alt="remove admin" title="remove admin"
			width="24"
			onClick={() => removeAdmin(member)}/> : <></>
		);
	}

	const trimUsername = (username: string) =>
	{
		return (username.length < 15 ? username : username.slice(0, 13) + '..');
	}

	const challenge = async (member: User, powerUpMode: boolean) =>
	{
		axiosInstance.current = await axiosToken();
		const challenge = await axiosInstance.current.post('/challenge/', {powerUpMode: powerUpMode, senderId: currentUser!.id, receiverId: member.id}, {
			headers: {
				"Content-Type": "application/json"
			}
		});
		window.location.href = 'http://localhost:3000/challenge/' + challenge.data.id;
	}

	const selectMode = (member: User) =>
	{
		isUserStillMember(currentUser!.id).then(async (ret: boolean) =>
		{
			if (ret)
			{
				isUserStillMember(member.id).then(async (ret: boolean) =>
				{
					if (ret)
					{
  					 	confirmAlert({
     						customUI: ({onClose}) =>
							{
       							return (
									<div id={alertStyle.boxContainer}>
										<h1>Challenge {trimUsername(member.username)}</h1>
										<p>Select a pong mode</p>
										<div id={alertStyle.alertBoxBtn}>
											<button onClick={() =>
												{
								 					challenge(member, false);
													onClose();
												}
												}>normal</button>
											<button onClick={() =>
						  						{
													challenge(member, true)
													onClose();
												}}>power-up</button>
										</div>
          							</div>
        						);
      						}
    					});
					}
					else
					{
						printInfosBox(member.username + ' is not member anymore');
						removeMemberFromList(member);
					}
				});
			}
		});
	}

	const challengeLogo = (member: User) =>
	{
		return (currentUser!.id !== member.id ? 
			<img className={style.memberAction} src="http://localhost:3000/images/challenge.png" 
			alt={"challenge" + member.username} title={"challenge " + member.username}
			width="20"
			onClick={() => selectMode(member)}/> : <></>
		);
	}

	const isUserStillMember = async (userId: number): Promise<boolean> =>
	{
		try
		{
			axiosInstance.current = await axiosToken();
			const member: AxiosResponse = await axiosInstance.current.get('/chatRoom/member/' + roomName + '/' + userId);
			axiosInstance.current = await axiosToken();
			const user: AxiosResponse = await axiosInstance.current.get('/users/me');

			if (!member.data.members.length)
			{
				if (userId === user.data.id)
				{
					axiosInstance.current = await axiosToken();
					const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
					axiosInstance.current = await axiosToken();
						const penalties: Penalty[] = room.data.penalties;
					let banned = false;
					penalties.forEach((penalty: Penalty) =>
					{
						if (penalty.target.id === 
						user.data.id && penalty.type === 'BAN')
						{
							setRoomStatus(RoomStatus["BANNED" as keyof typeof RoomStatus]);
							banned = true;
						}
					});
					if (!banned)
						setRoomStatus(RoomStatus["NOT_JOINED" as keyof typeof RoomStatus])
				}
				return (new Promise(resolve => {resolve(false)}));
			}
			else
			{
				if (userId === user.data.id)
					setRoomStatus(RoomStatus["JOINED" as keyof typeof RoomStatus])
				return (new Promise(resolve => {resolve(true)}));
			}
		}
		catch (error: any)
		{
			console.log('error (is user still in room) :', error);
			return (new Promise(resolve => {resolve(false)}));
		}
	}

	const checkIfAdmin = async (member: User): Promise<boolean> =>
	{
		try
		{
			axiosInstance.current = await axiosToken();
			const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomName);
			for(var i: number = 0; i < admins.length; ++i)
			{
				if (room.data.admins[i].id === member.id)
				{
					return (new Promise(resolve => {resolve(true)}));
				}
			}
			return (new Promise(resolve => {resolve(false)}));
		}
		catch (error: any)
		{
			console.log('error (checking if user is admin) :', error);
			return (new Promise(resolve => {resolve(false)}));
		}
	}

	const kick = (member: User) =>
	{
		try
		{
			isUserStillMember(currentUser!.id).then(async (ret: boolean) =>
			{
				if (ret)
				{
					isUserStillMember(member.id).then(async (ret: boolean) =>
					{
						if (ret)
						{
							axiosInstance.current = await axiosToken();
							const user: AxiosResponse = await axiosInstance.current.get('/users/me');
							checkIfAdmin(user.data).then(async (isOwner) =>
							{
								if (isOwner)
								{
									axiosInstance.current = await axiosToken();
									await axiosInstance.current.patch('/chatRoom/removeUser/' + roomName, {userId: member.id});
									printInfosBox(member.username + ' has been kicked');
									removeMemberFromList(member);
								}
							})
						}
						else
						{
							printInfosBox(member.username + ' is not member anymore');
							removeMemberFromList(member);
						}

					});

				}
			});
		}
		catch (error: any)
		{
			console.log('error (while kicking) :', error);
		}
	}

	const kickLogo = (member: User) =>
	{
		return (isAdmin(currentUser!) && currentUser!.id !== member.id && member.id !== owner.current!.id ? 
			<img className={style.memberAction} src="http://localhost:3000/images/kick.png" 
			alt={"kick" + member.username} title={"kick " + member.username}
			width="20"
			onClick={() => kick(member)}/> : <></>
		);
	}

	const removeMemberFromList = (memberToRemove: User) =>
	{
		for (let i = 0; i < membersList.length; ++i)
		{
			if (membersList[i].id === memberToRemove.id)
			{
				let newMembersList: User[] = [...membersList];
				newMembersList.splice(i, 1);
				setMembersList(newMembersList);
				break;
			}
		}
	}

	const doesUserHasPenalty = async (member: User, type: PenaltyType): Promise<boolean> =>
	{
		axiosInstance.current = await axiosToken();
		const penalties: AxiosResponse = await axiosInstance.current.get('/chatRoom/penalty/' + roomName + '/' + member.id);

		for (let i = 0; i < penalties.data.penalties.length; ++i)
		{
			if (penalties.data.penalties[i].type === type)
				return (new Promise(resolve => {resolve(true)}));
		}
		return (new Promise(resolve => {resolve(false)}));
	}

	const applyPenalty = (member: User, duration: number, type: PenaltyType) =>
	{
		try
		{
			isUserStillMember(currentUser!.id).then(async (ret: boolean) =>
			{
				if (ret)
				{
					axiosInstance.current = await axiosToken();
					const user: AxiosResponse = await axiosInstance.current.get('/users/me');
					checkIfAdmin(user.data).then(async (ret: boolean) =>
					{
						if (ret)
						{	
							doesUserHasPenalty(member, type).then(async (ret: boolean) =>
							{
								if (!ret)
								{
									isUserStillMember(member.id).then(async (ret: boolean) =>
									{
										if (ret)
										{
											axiosInstance.current = await axiosToken();
											await axiosInstance.current.post('/penalty/',
											{type: type, authorId: currentUser!.id, targetId: member.id,
											roomName: roomName, durationInMin: duration},
											{headers: {"Content-Type": "application/json"}});
											if (type === 'BAN')
											{
												axiosInstance.current = await axiosToken();
												await axiosInstance.current.patch('/chatRoom/removeUser/' + roomName, {userId: member.id});
												printInfosBox(member.username + ' has been banned');
												removeMemberFromList(member);
											}
											else if (type === 'MUTE')
											{
												printInfosBox(member.username + ' has been muted');
												const newMembersMuted = [...membersMuted];
												newMembersMuted.push(member);
												setMembersMuted(newMembersMuted);
											}
										}
										else
										{
											printInfosBox(member.username + ' is not member anymore');
											removeMemberFromList(member);
										}
									});
								}
								else
								{
									if (type === 'BAN')
									{
										printInfosBox(member.username + ' has already been banned');
										removeMemberFromList(member);
									}
									else if (type === 'MUTE')
									{
										printInfosBox(member.username + ' has already been muted');
										const newMembersMuted = [...membersMuted];
										newMembersMuted.push(member);
										setMembersMuted(newMembersMuted);
									}
								}
							})
						}
					})
				}
			})
		}
		catch (error: any)
		{
			console.log('error (apply penalty) :', error);
		}
	}

	const selectPenaltyTime = (member: User, type: PenaltyType) =>
	{
  	 	confirmAlert(
		{
    		customUI: ({onClose}) => {
       		return (
				<div id={alertStyle.boxContainer}>
					<h1>{type.charAt(0).toUpperCase() + type.toLowerCase().slice(1)} {trimUsername(member.username)}</h1>
					<p>Select duration</p>
					<div id={alertStyle.alertBoxBtn}>
						<button onClick={() => {applyPenalty(member, 1, type); onClose()}}>1 min</button>
						<button onClick={() => {applyPenalty(member, 15, type); onClose()}}>15 min</button>
						<button onClick={() => {applyPenalty(member, 60, type); onClose()}}>1 hour</button>
						<button onClick={() => {applyPenalty(member, 360, type); onClose()}}>6 hours</button>
						<button onClick={() => {applyPenalty(member, 1440, type); onClose()}}>1 day</button>
						<button onClick={() => {applyPenalty(member, 10080, type); onClose()}}>1 week</button>
					</div>
          		</div>
        		);
      		}
    	});
	}

	const banLogo = (member: User) =>
	{
		return (isAdmin(currentUser!) && currentUser!.id !== member.id && member.id !== owner.current!.id ? 
			<img className={style.memberAction} src="http://localhost:3000/images/ban.png" 
			alt={"ban " + member.username} title={"ban " + member.username}
			width="20"
			onClick={() => selectPenaltyTime(member, PenaltyType["BAN" as keyof typeof PenaltyType])}/> : <></>
		);
	}

	const muteLogo = (member: User) =>
	{
		return (isAdmin(currentUser!) && currentUser!.id !== member.id && member.id !== owner.current!.id && 
		!isMemberMuted(member)? 
			<img className={style.memberAction} src="http://localhost:3000/images/mute.png" 
			alt={"mute " + member.username} title={"mute " + member.username}
			width="20"
			onClick={() => selectPenaltyTime(member, PenaltyType["MUTE" as keyof typeof PenaltyType])}/> : <></>
		);
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
								<li className={currentUser && currentUser.id
								!== member.id? style.member : 
								style.currentMember} key={member.id}>
									{trimUsername(member.username)}
									{printRole(member)}
									{makeOwnerLogo(member)}
									{makeAdminLogo(member)}
									{removeAdminLogo(member)}
									{challengeLogo(member)}
									{kickLogo(member)}
									{banLogo(member)}
									{muteLogo(member)}
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
			if (user.data.id !== room.data.owner.id)
			{
				axiosInstance.current = await axiosToken();
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
			console.log('error (leave room) :', error);
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
						<p id={style.roomStatusMsg}>You are not a member of {roomName} room</p>
						<Link id={style.roomStatusBtn} to={`/chat/`}>rooms</Link>
					</div>);
		}
		else if (roomStatus === 'NOT_EXIST')
		{
			return (
					<div id={style.roomStatusContainer}>
						<p id={style.roomStatusMsg}>Room {roomName} does not exist</p>
						<Link id={style.roomStatusBtn} to={`/chat/`}>rooms</Link>
					</div>);
		}
		else if (roomStatus === 'BANNED')
		{
			return (
					<div id={style.roomStatusContainer}>
						<p id={style.roomStatusMsg}>You have been temporarily banned from {roomName} room, try later</p>
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
