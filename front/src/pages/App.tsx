import React from "react";
import "../styles/App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/TokenContext";
import Main from "./home/Main";
import Signin from "./signin/signin";
import Signup from "./signup/signup";
import SetTfa from "./settings/components/SetTfa";
import DeleteTfa from "./settings/components/DeleteTfa";
import VerifTfa from "./settings/components/VerifTfa";
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

/*<Route element={<PrivateRoutes /> } ></Route>
        </Route>*/
function App() {
  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={4}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/auth/signin/42login/callback"
            element={<Callback />}
          />
          <Route element={<PrivateRoutes />}>
            <Route path="/user" element={<User />} />
            <Route path="/history" element={<History />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/games/:gameId?" element={<Games />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/room/:roomId" element={<ChatRoomBase />} />
            <Route path="/2factivate" element={<SetTfa />} />
            <Route path="/2fadelete" element={<DeleteTfa />} />
            {/* <Route path="/2faverif" element={<VerifTfa setTfaSuccess={}/>} /> */}
            <Route path="user/:userId" element={<UserProfile />} />
          </Route>
        </Routes>
      </BrowserRouter></SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
