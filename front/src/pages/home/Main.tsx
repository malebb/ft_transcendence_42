import React from "react";
import "../../styles/App.css";
import Headers from "../../components/Headers";
import Canvas from "./components/Canvas";
import axios  from "axios";
import { getRefreshHeader } from "src/api/axios";
import Sidebar from "../../components/Sidebar";
import backgroundVideo from "../../content/background.mp4";

function Main() {

  const userSessionId = JSON.parse(sessionStorage.getItem("id")!);

  const onClick = async () => {
    const new_jwt = await axios.post(
      "http://localhost:3333/auth/refresh",
      {},
      {
        headers: {
          Authorization: getRefreshHeader(),
        },
      }
    );
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
