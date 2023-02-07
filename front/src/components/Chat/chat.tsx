import React, { useEffect, useRef } from 'react';
// import * as blah -> signifie qu'on importe le package et qu'on lui donne un nom,
// si on veut appeler SocketIOClient.Socket, on doit l'ecrire io.Socket
import * as io from 'socket.io-client';

const Chat = () => {

	const socketClient = useRef<io.Socket>()

	// connexion du client au server
	useEffect(() => {
		socketClient.current = io.connect("http://localhost:3333");

		if (socketClient.current) { // si on est connecte

		}
	}, [])

	return (
		<div>Chat</div>
	);
}
  
export default Chat;

