import { useContext, useDebugValue } from "react";
import AuthContext from 'src/context/TokenContext'

const useAuth = () => {
    const context = useContext(AuthContext);
    useDebugValue(context, context => context?.token ? "Logged In" : "Logged Out")
    return useContext(AuthContext);
}

export default useAuth;