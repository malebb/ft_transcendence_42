import React, { createContext, useState, useEffect } from "react";
import { TokensInterface } from "src/interfaces/Sign";

type AuthContextType = {
  token: TokensInterface | undefined | null;
  setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>>;
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
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

const AuthContext = createContext<AuthContextType>(iAuthContextState);

export const AuthProvider = ({ children }: { children: any }) => {
  const [token, setToken] = useState<TokensInterface>();
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<number>();
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
