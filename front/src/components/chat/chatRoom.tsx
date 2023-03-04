import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import MessagesContainer from "./containers/Message";
import { SocketContext } from "./context/socket.context";
import EVENTS from "./config/events";
import { useEffect, useRef, useState } from 'react';
import { axiosToken } from '../../api/axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import style from "./ChatRoom.module.css"
import Headers from '../Headers';
import Sidebar from '../Sidebar';
import { RoomStatus } from './utils/RoomStatus';



interface Room {
	roomId: string;
	admin: string;
	// members: ChatRoomUser[];
	createdAt: Date;
  }
 
const ChatRoomBase = () => {

	const socket = SocketContext();

	const { roomId } = useParams();
	const axiosInstance = useRef<AxiosInstance | null>(null);
	const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);

	useEffect(() => {
		const checkRoom = async () =>
		{
			try
			{
				axiosInstance.current = await axiosToken();
				const room: AxiosResponse = await axiosInstance.current.get('/chatRoom/' + roomId);

				if (!room.data)
					setRoomStatus(RoomStatus["NOT_EXIST" as keyof typeof RoomStatus]);
				else
				{
					const member: AxiosResponse = await axiosInstance.current.get('/chatRoom/member/' + roomId);

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
/*
	if (!roomId?.length) return <></>


	let newRoom: Room = {
		admin: "ldermign",
		roomId: roomId,
		createdAt: new Date(),
	  };

	socket.emit(EVENTS.CLIENT.JOIN_ROOM, newRoom);
*/
	const genTitle = () => {
		return (
			<div className={style.title}>
				<h1 className={style.logo}>{roomId}</h1>
				<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
				  <path fill="#413368" d="M37.7,-48.2C52.8,-41,71.7,-35.2,78.9,-23.2C86.1,-11.3,81.6,6.9,71.8,19.2C62.1,31.4,47.1,37.8,34.2,45.1C21.4,52.4,10.7,60.7,-0.1,60.9C-11,61,-21.9,53.1,-36.1,46.2C-50.2,39.3,-67.6,33.5,-75.2,21.7C-82.8,9.9,-80.7,-7.8,-73.8,-22.3C-66.8,-36.8,-54.9,-48,-41.8,-55.8C-28.7,-63.7,-14.3,-68.2,-1.5,-66.1C11.3,-64,22.6,-55.4,37.7,-48.2Z" transform="translate(100 100)" />
				</svg>
			</div>
		)
	}

	const checkRoomStatus = () =>
	{
		if (roomStatus === 'JOINED')
		{
			return (
			<>
				{genTitle()}
				<div className={style.chat}>
						<MessagesContainer />
				</div>
			</>
			);
		}
		else if (roomStatus === 'NOT_JOINED')
		{
			return (<p id={style.roomStatus}>You are not a member of {roomId} room</p>);
		}
		else if (roomStatus == 'NOT_EXIST')
		{
			return (<p id={style.roomStatus}>Room {roomId} does not exist</p>);
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

//TODO changer le chemin pour EVENTS
