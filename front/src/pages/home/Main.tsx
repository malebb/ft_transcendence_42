import React, { useEffect, useRef, useContext} from "react";
import "../../styles/App.css";
import Headers from "../../components/Headers";
import Canvas from "./components/Canvas";
import axios, { AxiosInstance } from "axios";
import { axiosToken, getRefreshHeader } from "src/api/axios";
import Sidebar from "../../components/Sidebar";
import backgroundVideo from "../../content/background.mp4";
import { Socket, io } from "socket.io-client";
import { SocketContext } from '../../context/SocketContext';

function Main() {

//  const socket = useRef<Socket | null>(null);

  const userSessionId = JSON.parse(sessionStorage.getItem("id")!);
  const socket = useContext(SocketContext);

  useEffect(() => {
//    if (typeof userSessionId === "number") {
 /*     socket.current = io("ws://localhost:3333/user", {
        transports: ["websocket"],
        forceNew: true,
        upgrade: false,
      });*/
     // this.props.socket.current.on("connect", async () => {

        // It's possible that the value of userId is being converted to an object during the WebSocket communication.
        // When you emit the USER_ONLINE event with userId in your frontend code, you are passing it as a parameter to the emit method, which serializes the data into a JSON string before sending it over the WebSocket connection. Then, in your backend code, the userId parameter is deserialized from the JSON string, which may cause it to be converted to an object if the serialization and deserialization process is not handled correctly.
//        socket.emit("USER_ONLINE", userSessionId);
 //       return () => {
     //     socket.current?.disconnect();
   //     };
   //   });
  //  }
  }, []);

  const onClick = async () => {
    console.log(getRefreshHeader());
    const new_jwt = await axios.post(
      "http://localhost:3333/auth/refresh",
      {},
      {
        headers: {
          Authorization: getRefreshHeader(),
        },
      }
    );
    console.log(new_jwt.data);
  };
  return (
    <div className="App">
      <Headers />
      <div className="Menu">
        <Sidebar />
      </div>
      <main className="main-video">
        {userSessionId === null ? (
          <video autoPlay={true} muted={true} loop={true} id="old-game-video">
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : (
          <Canvas />
        )}
      </main>
    </div>
  );
}

export default Main;
