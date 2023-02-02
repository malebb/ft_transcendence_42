// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import axios from "axios";
// import { Navigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { allUsersRoute } from "./utils/APIRoutes";


// const Chat = () => {

// 	const navigate = useNavigate()

// 	const [contacts, setContactes] = useState([]);
// 	const [currentUser, setCurrentUser] = useState(undefined);

// 	useEffect(() => {
// 		const fetchData = async () => {
// 		  try {
// 			if (!localStorage.getItem("chat-app-user")) {
// 				navigate("/login");
// 			} else {
// 				const item = localStorage.getItem("chat-app-user");
// 				if (item)
// 					setCurrentUser(await JSON.parse(item))
// 			}
// 		  } catch (error) {
// 			console.error(error);
// 		  }
// 		};
// 		fetchData();
// 	  }, []);

// 	useEffect(() => {
// 		const tmp = async () => {
// 			if (currentUser) {
// 				const data = await axios.get(`${allUsersRoute}/{currentUser.id}`);
// 				setContactes(data.data);
// 			}
// 		}
// 	}, [currentUser]);

// 	return (
// 		<Container>
// 			<div className='container'>
// 				{/* <Contacts contacts={contacts} currentUser={currentUser}/> */}
// 			</div>
// 		</Container>
// 	)
// }

// const Container = styled.div`
// 	height: 100vh;
// 	width: 100vw;
// 	display: flex;
// 	flex-direction: column;
// 	justify-content: center;
// 	gap: 1rem;
// 	align-items: center;
// 	background-color: #A9A9F1;
// 	.container {
// 		height: 85vh;
// 		width: 85vw;
// 		background-color: #131324;
// 		grid: end;
// 		grid-template-column: 25% 75%; 
// 		@media screen and (min-width:720px) and (max-width:1080) {
// 			grid-template-columns: 35% 65%;
// 		}
// 	}
// `;

// export default Chat;

import { useSockets } from './context/socket.context';

import RoomsContainer from './containers/Rooms';
import MessagesContainer from './containers/Message';
import { useRef, useEffect } from "react";
// import styles from "./utils/Home.css";

export default function Home() {
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

		localStorage.setItem("username", value);

	}

	useEffect(() => {
		if (usernameRef)
		  usernameRef.current.value = localStorage.getItem("username") || "";
	  }, []);

	return (
		<div>
		  {!username && <div>
			<input placeholder="Username" ref={usernameRef} />
				<button onClick={handleSetUsername}>
				  START
				</button>
		  </div>}
		  {
			username && <>
			  <RoomsContainer />
			  <MessagesContainer />

			</>
		  }

		</div>
	  );
	}