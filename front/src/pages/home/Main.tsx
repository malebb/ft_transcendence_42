import React, { useContext, useEffect, useState } from "react";
import "../../styles/App.css";
import Headers from "../../components/Headers";
<<<<<<< HEAD
import Canvas from "./components/Canvas";
import axios  from "axios";
import { getRefreshHeader } from "src/api/axios";
=======
import Canvas from "src/components/Canvas";
import axios from "axios";
import { getJWTfromRt, getRefreshHeader } from "src/api/axios";
>>>>>>> modifJWT
import Sidebar from "../../components/Sidebar";
import backgroundVideo from "../../content/background.mp4";
import AuthContext from "src/context/TokenContext";
import Cookies from "js-cookie";
import Loading from "../Loading";

function Main() {
<<<<<<< HEAD

  const userSessionId = JSON.parse(sessionStorage.getItem("id")!);

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
=======
  
  const {token, setToken, username, setUsername, userId} = useContext(AuthContext);
  const userSessionId = userId!;

>>>>>>> modifJWT
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
          </>
        )}
        
      </main>
    </div>
  );
}

export default Main;
