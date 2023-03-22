import React, { useContext } from "react";
import "../../styles/App.css";
import Headers from "../../components/Headers";
import Canvas from "src/components/Canvas";
import axios from "axios";
import { getRefreshHeader } from "src/api/axios";
import Sidebar from "../../components/Sidebar";
import backgroundVideo from "../../content/background.mp4";
import AuthContext from "src/context/TokenContext";

function Main() {
  
  const {token, setToken, username, setUsername} = useContext(AuthContext);
  const userSessionId = JSON.parse(localStorage.getItem("id")!);
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
          <>
          <Canvas />
          <p tabIndex={99}>{username}</p>
          {token?.access_token}
          </>
        )}
        
      </main>
    </div>
  );
}

export default Main;
