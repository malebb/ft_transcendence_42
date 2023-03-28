import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { TokensInterface } from "src/interfaces/Sign";

const socket: Socket = io(`ws://localhost:3333/user`,
{
	transports: ["websocket"],
	forceNew: true,
	autoConnect: false,
});

export const SocketContext = React.createContext<Socket>(socket);

export const SocketProvider = ({ children, token }: { children: any, token: TokensInterface | undefined | null}) => {

	useEffect(() => {
		const reconnectSocketOnRefresh = () =>
		{
			if (token !== null && token !== undefined)
			{
				socket.auth = {token: token.access_token}
				socket.connect();
			}
		}
		
		reconnectSocketOnRefresh();
	
	}, [])
  
	 return (
	   <SocketContext.Provider
	 	value={socket}
	   >
	 	{children}
	   </SocketContext.Provider>
	 );
	
};

