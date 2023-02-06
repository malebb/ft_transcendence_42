import { useSockets } from './context/socket.context';

import RoomsContainer from './containers/Rooms';
import MessagesContainer from './containers/Message';
import { useRef, useEffect } from "react";
// import styles from "../../styles/Home.module.css";

// import styles from "./utils/Home.css";


export default function Home() {

	// var socket = io.connect("http://localhost:3333");

	const { socket, username, setUsername } = useSockets();
	const usernameRef = useRef<any>(null)

	function handleSetUsername() {
		// if (!usernameRef.current)
		// 	return;
		const value = usernameRef.current.value;
		if (!value) {
			return ;
		}
		setUsername(value);
		
		console.log(value);
		localStorage.setItem("username", JSON.stringify(value));
		
	}
	
	useEffect(() => {
		if (usernameRef)
		usernameRef.current.value = localStorage.getItem("username") || "";
	}, []);
	
	return (
		<div>
		  {!username && (
			<div >
			  <div >
				<input placeholder="Username" ref={usernameRef} />
				<button className="cta" onClick={handleSetUsername}>
				  START
				</button>
			  </div>
			</div>
		  )}
		  {username && (
			<div >
			  <RoomsContainer />
			  <MessagesContainer />
			</div>
		  )}
		</div>
	  );
	}


