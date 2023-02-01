import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/default';
import { createContext, useContext, useEffect, useState } from 'react';

interface Context {
	socket: Socket;
	username?: string
	setUsername: Function;
	roomId?: string;
	rooms: object;
}

const socket = io(SOCKET_URL);

const SocketContext = createContext<Context>({
	socket,
	setUsername: () => false,
	rooms: {}
});

function SocketsProvider(props: any) {

	const [username, setUsername] = useState("");
	const [roomId, setRoomId] = useState("");
	const [rooms, setRooms] = useState([])


return (
    <SocketContext.Provider
      value={{
        socket,
		username,
		setUsername,
		rooms,
		roomId,

      }}
      {...props}
    />
  );
}

// // check useContext
export const useSockets = () => useContext(SocketContext);

export default SocketsProvider;



