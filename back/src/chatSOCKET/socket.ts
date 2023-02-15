import { nanoid } from 'nanoid';
import { Server, Socket } from "socket.io";
import log from './utils/logger';

/*
partie server de socket.io :
va monter le server node.js
*/

interface Room {
	id: number;
	name: string;
	users: Array<number>;
}

const EVENTS = {
	// connection: 'connection',
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

const INSTRUCTIONS = {
	// <> ou [] = obligatoire ou facultatif ??
	//CREATE_ROOM "my_room" <jeannifr>
	CREATE_ROOM: {
		// arguments pour la creation de la room
		argc: 2, 

	},	
};

const io = new Server(4444, {
	cors: {
		origin: "*",
		credentials: true,
	}
});

io.on('connect', (socket) => {

	console.log('a user connected');

	
	// });
	socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, ({roomId, message, username}) => {
		
		console.log(username + " send " + message + " on " + roomId);
		io.emit(EVENTS.SERVER.ROOM_MESSAGE, ({roomId, message, username}));
	
	// socket.on(EVENTS.CLIENT.CREATE_ROOM, (roomName) => {
		
	// creation d'une nouvelle chaine (create a room id)
		// room.id = nanoid()
		//add a new roomto the rooms object
		// rooms[roomId] = {
			// 	name: roomName,
			// }
			// })

		});
		
		socket.on('disonnect', () => {
			console.log('a user disconnected');
		})
// io.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, (socket) => {
// 	console.log({socket});
// 	io.emit(EVENTS.SERVER.ROOM_MESSAGE, ({roomId, message, username}) => {
// 		console.log(42);
// 		console.log(message);
// 	});
});


// clef = string (roomId), object as body
const rooms: Record<string, { name: string }> = {}

function socket() {

	log.info(`Socket connected`);

	// io.on(EVENTS.connection, (socket: Socket) => {
	// 	log.info(`User connected ${socket.id}`);

	// 	/*
	// 	creation d'une nouvelle room par un client
	// 	*/
	// 	socket.on(EVENTS.CLIENT.CREATE_ROOM, ({roomName}) => {
	// 		console.log({ roomName });
	// // creation d'une nouvelle chaine (create a room id)
	// 		const roomId = nanoid()
	// 		//add a new roomto the rooms object
	// 		rooms[roomId] = {
	// 			name: roomName,
	// 		}

	// 		socket.join(roomId);

	// 		//broadcast an event saying there is a new room
	// 		socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

	// 		// emit back to the room creator with all the rooms
	// 		socket.emit(EVENTS.SERVER.ROOMS, rooms);

	// 		// emit evnt back the the room creator saying they have joined a room
	// 		socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);

	// 	});

	// 	/*
	// 	quand un client envoie un message dans la room
	// 	*/
	// 	socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, ({roomId, message, username}) => {
	// 		const date = new Date();
	// 		console.log("message envoye ????");
	// 		socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
	// 			message,
	// 	        username,
	//         	time: `${date.getHours()}:${date.getMinutes()}`,
	// 		})

	// 	});

	// 	/*
	// 	quand un utilisateur va dans une room
	// 	*/
	// 	socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {

	// 		console.log(`Socket ${socket.id} joining ${roomId}`);
	// 		socket.join(roomId);

	// 		socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
	// 	})
	// });

}

export default socket;

/* 	reference socket

socket.emit('message', "this is a test"); //sending to sender-client only

socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender

socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender

socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)

socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid

io.emit('message', "this is a test"); //sending to all clients, include sender

io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender

io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender

socket.emit(); //send to all connected clients

socket.broadcast.emit(); //send to all connected clients except the one that sent the message

socket.on(); //event listener, can be called on client to execute on server

io.sockets.socket(); //for emiting to specific clients

io.sockets.emit(); //send to all connected clients (same as socket.emit)

io.sockets.on() ; //initial connection from a client.

*/