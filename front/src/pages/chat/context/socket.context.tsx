// import io from "socket.io-client";
// import React, { useContext } from "react";

// /**
// //* INFO

// Dans ce fichier, on cree un context pour pouvoir utiliser la socket 
// et envoyer des infos vers le back.
// On appel ce fichier dans les pages room, message, etc. en utilisant :
//   import { SocketContext } from "../context/socket.context";
//   const { socket } = SocketContext();

// //! lien : https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
// (vraiment tres bien)

// **/

// export const socket = io("ws://localhost:3333/chat", {
//   transports: ["websocket"],
//   forceNew: true,
//   //.https://stackoverflow.com/questions/34428404/socket-io-disconnect-not-called-if-page-refreshed-fast-enough
//   upgrade: false,
//   query: {
//     // playerData: JSON.stringify(playerData),
//     // sepctator: false,
//   },
// });
// export const useSocket = React.createContext(socket);
// export const SocketContext = () => useContext(useSocket);
export{}