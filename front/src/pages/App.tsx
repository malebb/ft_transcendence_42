import { useContext } from "react";
import "../styles/App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import AuthContext  from "../context/TokenContext";
import Main from "./home/Main";
import Signin from "./signin/signin";
import Signup from "./signup/signup";
import SetTfa from "./settings/components/SetTfa";
import DeleteTfa from "./settings/components/DeleteTfa";
import User from "./settings/User";
import History from "./history/History";
import Friends from "./friends/Friends";
import Games from "./games/Games";
import Callback from "./signin/components/Callback";
import UserProfile from "./users/UserProfile";
import Chat from "./chat/chat";
import ChatRoomBase from "./chat/chatRoom";
import PrivateRoutes from "./privateRoute/PrivateRoutes";
import { SnackbarProvider } from "notistack";
import NotFound from "./error/NotFound";
import Logout from "./logout/Logout";
import { SocketProvider } from '../context/SocketContext';
import Challenge from './challenge/Challenge';

function App() {

  const {token} = useContext(AuthContext);
  return (
	<SocketProvider token={token}>
      <SnackbarProvider maxSnack={4}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          {/* <Route element={<NotAuthRoutes />}> */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/auth/signin/42login/callback"
            element={<Callback />}
          />
          {/* </Route> */}
          <Route element={<PrivateRoutes />}>
            <Route path="/user" element={<User />} />
            <Route path="/history" element={<History />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/challenge/:challengeId" element={<Challenge />} />
            <Route path="/games/:gameId?" element={<Games />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/room/:roomName" element={<ChatRoomBase />} />
            <Route path="/2factivate" element={<SetTfa />} />
            <Route path="/2fadelete" element={<DeleteTfa />} />
            <Route path="user/:paramUserId" element={<UserProfile />} />
            <Route path='/logout' element={<Logout/>} />
          </Route>
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter></SnackbarProvider>
	  </SocketProvider>
  );
}

export default App;
