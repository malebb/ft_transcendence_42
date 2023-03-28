import React from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from '../api/axios';

export const socket: Socket = io(`ws://localhost:3333/user`,
{
	transports: ["websocket"],
	forceNew: true,
	autoConnect: false,
});

export const SocketContext = React.createContext<Socket>(socket);

export default SocketContext;

const reconnectSocketOnRefresh = () =>
{
	if (getToken() !== null)
	{
		socket.auth = {token: getToken().access_token}
		socket.connect();
	}
}

reconnectSocketOnRefresh();
