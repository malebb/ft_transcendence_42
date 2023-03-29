import React, { useContext, useEffect, useState } from "react";
import "../../styles/App.css";
import Headers from "../../components/Headers";
import Canvas from "./components/Canvas";
import axios from "axios";
import { getJWTfromRt, getRefreshHeader } from "src/api/axios";
import Sidebar from "../../components/Sidebar";
import backgroundVideo from "../../content/background.mp4";
import AuthContext from "src/context/TokenContext";
import Cookies from "js-cookie";
import Loading from "../Loading";

function Main() {
  
  const {token, setToken, username, setUsername, userId} = useContext(AuthContext);
  const userSessionId = userId!;

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
      <p>{token?.access_token}</p>
          <Canvas />
          </>
        )}
      </main>
    </div>
  );
}

export default Main;
