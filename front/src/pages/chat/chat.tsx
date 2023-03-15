import {
  Link,
  Routes,
  Route,
  useParams,
  BrowserRouter,
} from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Rooms from "./containers/Rooms";
// import Header from "../Headers";
// import SideBar from "../Sidebar";
import Headers from "src/components/Headers";
import Sidebar from "src/components/Sidebar";

const Chat = () => {
	return (
	<>
  			<Headers/>
  			<Sidebar/>
		<div id="chat">
			<Rooms/>
		</div>
	</>
  );
};

export default Chat;
