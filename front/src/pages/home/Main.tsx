import React, { useContext } from "react";
import "../../styles/App.css";
import Headers from "../../components/Headers";
import Canvas from "./components/Canvas";
import Sidebar from "../../components/Sidebar";
import backgroundVideo from "../../content/background.mp4";
import AuthContext from "src/context/TokenContext";

function Main() {
  
  const { userId} = useContext(AuthContext);
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
          <Canvas />
          </>
        )}
      </main>
    </div>
  );
}

export default Main;
