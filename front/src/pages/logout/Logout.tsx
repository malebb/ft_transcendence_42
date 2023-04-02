import { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';
import Loading from '../Loading';
import { useSnackbar } from 'notistack';
import useAxiosPrivate from 'src/hooks/usePrivate';
import AuthContext from 'src/context/TokenContext';
import { SocketContext } from '../../context/SocketContext';


const LOGOUT_PATH = "auth/logout";

const Logout = () => {
  const axiosPrivate = useAxiosPrivate();
  const context = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errMsg, setErrMsg] = useState<string>();
  const socket = useContext(SocketContext);
    
    const snackBar = useSnackbar();
    
    useEffect(() => {
      const logout = async () => {
        try {
          await axiosPrivate.post(LOGOUT_PATH);
          socket.disconnect();
          context.setToken(undefined);
          context.setUserId(undefined);
          context.setUsername(undefined);
        }
      catch (err: any) {
          setErrMsg("Oops something went wrong !");
        }
        sessionStorage.clear();
        setIsLoading(false);
      };
      logout();
    }, []);

    useEffect(() => {
      if (errMsg)
      {
        snackBar.enqueueSnackbar('Oops something went wrong during logout', {
        variant: "error",
        anchorOrigin: {vertical: "bottom", horizontal: "right"}
      })}
      else
      {
        snackBar.enqueueSnackbar('See you soon :(', {
        variant: "success",
        anchorOrigin: {vertical: "bottom", horizontal: "right"}
      })}
    }, [errMsg, snackBar])

  if (isLoading)
    return <Loading/>
  return <Navigate to='/' />
}

export default Logout;
