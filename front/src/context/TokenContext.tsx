import React, { createContext, useState } from "react";

type AuthContextType = {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
};

const iAuthContextState = {
  token: null,
  setToken: () => {},
  username: null,
  setUsername: () => {},
};

const AuthContext = createContext<AuthContextType>(iAuthContextState);

export const AuthProvider = ({ children }: { children: any }) => {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        username,
        setUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
