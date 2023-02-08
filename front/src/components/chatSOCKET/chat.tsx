import { useSockets } from './context/socket.context';
import RoomsContainer from './containers/Rooms';
import MessagesContainer from './containers/Message';
import { useRef, useEffect, useState } from "react";
// import styles from "../../styles/Home.module.css";

// import styles from "./utils/Home.css";

// export default function Home() {
const Chat = () => {
	const [user, setUser] = useState<string>("");
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
		setUser(value);
		
		console.log(value);
		localStorage.setItem("username", JSON.stringify(value));
	}

	useEffect(() => {
		if (usernameRef)
		usernameRef.current.value = localStorage.getItem("username") || "";
	}, []);
	
	return (
		<div>
		  {!user && (
			<div >
			  <div >
				<input placeholder="Username" ref={usernameRef} />
				<button className="cta" onClick={handleSetUsername}>
				  START
				</button>
			  </div>
			</div>
		  )}
		  {user && (
			<div >
			  <RoomsContainer username={user}/>
			  <MessagesContainer />
			</div>
		  )}
		</div>
	  );
}

export default Chat;
