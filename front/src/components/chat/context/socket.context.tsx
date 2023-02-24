import io from "socket.io-client";
import React, { useContext } from "react";

/**
//* INFO

Dans ce fichier, on cree un context pour pouvoir utiliser la socket 
et envoyer des infos vers le back.
On appel ce fichier dans les pages room, message, etc. en utilisant :
  import { SocketContext } from "../context/socket.context";
  const { socket } = SocketContext();

//! lien : https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
(vraiment tres bien)


**/

export const socket = io("http://localhost:4444");
export const useSocket = React.createContext(socket);
export const SocketContext = () => useContext(useSocket);
