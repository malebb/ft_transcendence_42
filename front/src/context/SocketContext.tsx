import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from '../api/axios';
import { useContext } from "react";
import AuthContext from "./TokenContext";
import useAuth from "src/hooks/useAuth";
import { TokensInterface } from "src/interfaces/Sign";

export const socket: Socket = io(`ws://localhost:3333/user`,
{
	transports: ["websocket"],
	forceNew: true,
	autoConnect: false,
});


export const SocketContext = React.createContext<Socket>(socket);

export const SocketProvider = ({ children }: { children: any }) => {

	const {token} = useContext(AuthContext);

	useEffect(() => {
		const reconnectSocketOnRefresh = () =>
		{
			console.log("socketContext refresh socket with token ==" + token);
			if (token !== null && token !== undefined)
			{
				socket.auth = {token: token.access_token}
				socket.connect();
			}
		}
		
		reconnectSocketOnRefresh();
	
	}, [])
  
	// return (
	//   <AuthContext.Provider
	// 	value={{
	// 	}}
	//   >
	// 	{children}
	//   </AuthContext.Provider>
	// );
	
  };

export default SocketContext;


