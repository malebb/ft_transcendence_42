import { AxiosResponse } from "axios";
import React, { createContext, useState, useEffect, useContext } from "react";
import { axiosMain } from "src/api/axios";
import { SignInterface, TokensInterface } from "src/interfaces/Sign";
import SocketContext from "./SocketContext";

type AuthContextType = {
  token: TokensInterface | undefined | null;
  setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>>;
  username: string | undefined | null;
  setUsername: React.Dispatch<React.SetStateAction<string | undefined>>;
  userId: number | undefined | null;
  setUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const iAuthContextState = {
  token: null,
  setToken: () => {},
  username: null,
  setUsername: () => {},
  userId: null,
  setUserId: () => {},
};

const REFRESH_PATH = 'auth/refresh'

const AuthContext = createContext<AuthContextType>(iAuthContextState);

export const AuthProvider = ({ children }: { children: any }) => {
  const [token, setToken] = useState<TokensInterface>();
  const [username, setUsername] = useState<string>();
  const [userId, setUserId] = useState<number>();

  useEffect(() => {
    const checkRTCookie = async() => {
      try{
      const response : AxiosResponse = await axiosMain.post<SignInterface>(REFRESH_PATH);
      console.log('App checkAuth == ' + JSON.stringify(response.data))
      // setUsername(response.data.username!);
      // setUserId(response.data.id);
      setToken(response.data.tokens)
      setUsername(response.data.username)
      setUserId(response.data.userId)
      }catch(err: any)
      {
        console.log(err)
      }
    }
    
    checkRTCookie();
  
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        username,
        setUsername,
        userId,
        setUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
  
};

export default AuthContext;
