import { nanoid } from 'nanoid';
import { Server, Socket } from "socket.io";
import logger from "./utils/logger";

const EVENTS = {
	connection: 'connection',
	CLIENT: {
		CREATE_ROOM: "CREATE_ROOM",
		SEND_ROOM_MESSAGE: "SEND_ROOM_MESAGE",
		JOIN_ROOM: "JOIN_ROOM",
	},
	SERVER: {
		ROOMS: "ROOMS",
		JOINED_ROOM: 'JOINED_ROOM',
		ROOM_MESSAGE: 'ROOM_MESSAGE',
	},
};

// clef = string (roomId), object as body
const rooms: Record<string, { name: string }> = {}

function socket({io}: {io:Server}) {

	logger.info(`Socket connected`);

	io.on(EVENTS.connection, (socket: Socket) => {
		logger.info(`User connected ${socket.id}`);

		/*
		creation d'une nouvelle room par un client
		*/
		socket.on(EVENTS.CLIENT.CREATE_ROOM, ({roomName}) => {
			console.log({ roomName });
	// creation d'une nouvelle chaine (create a room id)
			const roomId = nanoid()
			//add a new roomto the rooms object
			rooms[roomId] = {
				name: roomName,
			}

			socket.join(roomId);

			//broadcast an event saying there is a new room
			socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

			// emit back to the room creator with all the rooms
			socket.emit(EVENTS.SERVER.ROOMS, rooms);
			// emit evnt back the the room creator saying they have joined a room
			socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);

		});

		/*
		quand un client envoie un message dans la room
		*/
		socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, ({roomId, message, username}) => {
			const date = new Date();

			socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
				
			})

		});

		/*
		quand un utilisateur va dans une room
		*/
		socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
			socket.join(roomId);

			socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
		})
	});

}

export default socket


