import {
  Link,
  Routes,
  Route,
  useParams,
  BrowserRouter,
} from "react-router-dom";
import { useRef, useEffect, useState } from "react";
// import { SocketContext } from "./context/socket.context";
import RoomsContainer from "./containers/Rooms";
// import MessagesContainer from "./containers/Message";
import io, { Socket } from "socket.io-client";
// import ChatRoom from "./containers/ChatRoom";
import { ChatBaseRoom } from "./containers/ChatBaseRoom";
import EVENTS from "./config/events";

// doc: https://v5.reactrouter.com/web/example/url-params

const Chat = () => {
	// const {roomId} = useParams();

  const Landing = () => {
    return (
      <>
        <ul className="chat-room-list">
          {ChatBaseRoom.map((room: any) => (
            <li key={room.id}>
              <Link to={`/room/${room.id}`}>{room.title}</Link>
            </li>
          ))}
        </ul>
      </>
    );
  };

//   const ChatRoom = () => {

//     const room = ChatBaseRoom.find((x) => x.id === roomId);
//     console.log({ room });
//     if (!room) return <div></div>;

//     return (
//       <div>
//         {room && (
//           <div>
//             <h2>{room?.title}</h2>
//             <div onClick={ () => {
// 					socket?.emit("joinRoom", { roomId });
// 							}}/>
//           </div>
//         )}
//       </div>
//     );
//   };

  return (
    <div>
      <h2>Choose a Chat Room...</h2>
      <div>
        <Landing />
      </div>
      <h2>...or create a new one !</h2>
      {/* <div>{roomId ? <ChatRoom /> : <div />}</div> */}
      <div>
        <RoomsContainer />
      </div>
    </div>
  );
};

export default Chat;
