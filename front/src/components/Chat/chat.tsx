import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from "axios";
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { allUsersRoute } from "./utils/APIRoutes"

const Chat = () => {

	const navigate = useNavigate()

	const [contacts, setContactes] = useState([]);
	const [currentUser, setCurrentUser] = useState(undefined);

	useEffect(() => {
		const fetchData = async () => {
		  try {
			if (!localStorage.getItem("chat-app-user")) {
				// Navigate({to: "/login"});
				navigate("/login");
			} else {
				const item = localStorage.getItem("chat-app-user");
				if (item)
					setCurrentUser(await JSON.parse(item))
			}
		  } catch (error) {
			console.error(error);
		  }
		};
		fetchData();
	  }, []);

	useEffect(() => {
		const tmp = async () => {
			if (currentUser) {
				const data = await axios.get(`${allUsersRoute}/{currentUser.id}`);
				setContactes(data.data);
			}
		}
	}, [currentUser]);

	return (
		<Container>
			<div className='container'>

			</div>
		</Container>
	)
}

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 1rem;
	align-items: center;
	background-color: #A9A9F1;
	.container {
		height: 85vh;
		width: 85vw;
		background-color: #131324;
		grid: end;
		grid-template-column: 25% 75%; 
		@media screen and (min-width:720px) and (max-width:1080) {
			grid-template-columns: 35% 65%;
		}
	}
`;

export default Chat;