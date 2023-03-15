import { SocketContext } from "../context/socket.context";

import RoomsContainer from "../containers/Rooms";
import MessagesContainer from "../containers/Message";
import { useRef } from "react";

export default function Home() {
  // const { socket, username, setUsername } = SocketContext();
  // const usernameRef = useRef(null)

  // function handleSetUsername() {
  // 	if (!usernameRef.current)
  // 		return;
  // 	const value = usernameRef.current['value'];
  // 	if (!value) {
  // 		return ;
  // 	}

  // 	setUsername(value);

  // 	localStorage.setItem("username", value);

  // }

  return (
    <div>
      {/* {!username && (
				<div>
					<div>
					<input placeholder="Username" ref={usernameRef} />
						<button className="cta" onClick={handleSetUsername}>
						START
						</button>
					</div>
				</div>
			)}
			{username && (
				<div>
					<RoomsContainer />
					<MessagesContainer />
				</div>
			)} */}
    </div>
  );
}
