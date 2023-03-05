import {
  Link,
  Routes,
  Route,
  useParams,
  BrowserRouter,
} from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Rooms from "./containers/Rooms";
import Header from "../Headers";
import SideBar from "../Sidebar";

const Chat = () => {
	return (
	<>
  			<Header/>
  			<SideBar/>
		<div id="chat">
			<Rooms/>
		</div>
	</>
  );
};

export default Chat;
