import "../styles/App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/TokenContext";
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
import NotAuthRoutes from "./privateRoute/NotAuthRoutes";
import NotFound from "./error/NotFound";
import Logout from "./logout/Logout";
import Challenge from './challenge/Challenge';
import { SocketContext, socket } from '../context/SocketContext';

function App() {

  return (
		<AuthProvider>
			<SnackbarProvider maxSnack={4}>
				<SocketContext.Provider value={socket}>
					<BrowserRouter>
        				<Routes>
							<Route path="/" element={<Main />} />
          					<Route element={<NotAuthRoutes />}>
          					<Route path="/signin" element={<Signin />} />
          					<Route path="/signup" element={<Signup />} />
          					<Route path="/auth/signin/42login/callback"
            				element={<Callback />}/>
						</Route>
          				<Route element={<PrivateRoutes />}>
            				<Route path="/user" element={<User />} />
        					<Route path="/history" element={<History />} />
   					        <Route path="/friends" element={<Friends />} />
            				<Route path="/games/:gameId?" element={<Games />} />
         					<Route path="/challenge/:challengeId?" element={<Challenge />} />
          					<Route path="/chat" element={<Chat />} />
            				<Route path="/chat/room/:roomName" element={<ChatRoomBase />} />
            				<Route path="/2factivate" element={<SetTfa />} />
            				<Route path="/2fadelete" element={<DeleteTfa />} />
            {/* <Route path="/2faverif" element={<VerifTfa setTfaSuccess={}/>} /> */}
           					<Route path="user/:userId" element={<UserProfile />} />
            				<Route path='/logout' element={<Logout/>} />
          				</Route>
          				<Route element={<NotFound />}/>
        				</Routes>
      				</BrowserRouter>
				</SocketContext.Provider>
			</SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
