import React, { createContext, useState } from "react";
import { TokensInterface } from "src/interfaces/Sign";

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

const AuthContext = createContext<AuthContextType>(iAuthContextState);

export const AuthProvider = ({ children }: { children: any }) => {
  const [token, setToken] = useState<TokensInterface>();
  const [username, setUsername] = useState<string>();
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
