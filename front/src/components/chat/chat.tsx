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
		<div id="chat">
  			<Header/>
  			<SideBar/>
			<Rooms/>
		</div>
  );
};

export default Chat;
