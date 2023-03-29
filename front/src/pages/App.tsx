import React, { useContext, useEffect, useState } from "react";
import "../styles/App.css";
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import AuthContext, { AuthProvider } from "../context/TokenContext";
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
import { axiosMain, getJWTfromRt } from "src/api/axios";
import Cookies from "js-cookie";
import Loading from "./Loading";
import { AxiosError, AxiosResponse } from "axios";
import TokenContext from "../context/TokenContext";
import { SignInterface } from "src/interfaces/Sign";

const REFRESH_PATH = 'auth/refresh'
/*<Route element={<PrivateRoutes /> } ></Route>
        </Route>*/
      //   const useBeforeRender = (callback: any, deps: any) => {
      //     const [isRun, setIsRun] = useState(false);
      
      //     if (!isRun) {
      //         callback();
      //         setIsRun(true);
      //     }
      
      //     useEffect(() => () => setIsRun(false), deps);
      // };
// const REFRESH_PATH = 'auth/refresh'

function App() {

  const {token, setToken, setUserId, setUsername} = useContext(AuthContext);
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect(() => {
  //   let isMount = true;
  //   const controller = new AbortController();

  //   const checkRTCookie = async() => {
  //     try{
  //     const response : AxiosResponse = await axiosMain.post<SignInterface>(REFRESH_PATH, { signal: controller.signal});
  //     console.log('App checkAuth == ' + JSON.stringify(response.data))
  //     // setUsername(response.data.username!);
  //     // setUserId(response.data.id);
  //     if (isMount)
  //     {
  //     setToken(response.data.tokens)
  //     setUsername(response.data.username)
  //     setUserId(response.data.userId)
  //     }
  //     }catch(err: any)
  //     {
  //       console.log(err)
  //     }
  //   }
    
  //   checkRTCookie();
  //   return () => {
  //     isMount = false;
  //     controller.abort();
  //   } 
  // }, [])
  // useEffect(() => {
  //   const checkRTCookie = async() => {
  //     try{
  //     const response : AxiosResponse = await axiosMain.post(REFRESH_PATH);
  //     console.log('App checkAuth == ' + JSON.stringify(response.data))
  //     setUsername(response.data.username!);
  //     setUserId(response.data.id);
  //     setToken(response.data.tokens!)
  //     }catch(err: any)
  //     {
  //       console.log(err)
  //     }

  //   }
  //   checkRTCookie();
  //   // setIsLoading(false);
  // }, [])

  console.log('tok == ' + token?.access_token)

  // if (token?.access_token === undefined)
  //   return (<>
  //     {"tok == " + token?.access_token}
  //   <Loading/>
  //   </>)
  return (
    // <AuthProvider>
      <SnackbarProvider maxSnack={4}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route element={<NotAuthRoutes />}>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/auth/signin/42login/callback"
            element={<Callback />}
          /></Route>
          <Route element={<PrivateRoutes />}>
            <Route path="/user" element={<User />} />
            <Route path="/history" element={<History />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/games/:gameId?" element={<Games />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/room/:roomName" element={<ChatRoomBase />} />
            <Route path="/2factivate" element={<SetTfa />} />
            <Route path="/2fadelete" element={<DeleteTfa />} />
            {/* <Route path="/2faverif" element={<VerifTfa setTfaSuccess={}/>} /> */}
            <Route path="user/:paramUserId" element={<UserProfile />} />
            <Route path='/logout' element={<Logout/>} />
          </Route>
          <Route element={<NotFound />}/>
        </Routes>
      </BrowserRouter></SnackbarProvider>
    // {/* // </AuthProvider> */}
  );
}

export default App;
