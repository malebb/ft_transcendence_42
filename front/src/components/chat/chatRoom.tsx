import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import MessagesContainer from "./containers/Message";
import { SocketContext } from "./context/socket.context";
import EVENTS from "./config/events";
// import { EVENTS } from 'ft_transcendence';

import style from "./ChatRoom.module.css"

interface Room {
	roomId: string;
	admin: string;
	// members: ChatRoomUser[];
	createdAt: Date;
  }
 
const ChatRoomBase = () => {

	const socket = SocketContext();

	const { roomId } = useParams();

	if (!roomId?.length) return <></>

	let newRoom: Room = {
		admin: "ldermign",
		roomId: roomId,
		createdAt: new Date(),
	  };

	socket.emit(EVENTS.CLIENT.JOIN_ROOM, newRoom);

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

	return (
		<div className="roomBase">
			<div className="headerRoomName">
			{genTitle()}
			</div>
			<div className={style.chat}>
					<MessagesContainer />
				</div>
		</div>
	);
};

export default ChatRoomBase;

//TODO changer le chemin pour EVENTS