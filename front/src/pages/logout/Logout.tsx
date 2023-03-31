import { AxiosResponse } from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { useSnackbar } from 'notistack';
import useAxiosPrivate from 'src/hooks/usePrivate';
import Cookies from 'js-cookie';
import AuthContext from 'src/context/TokenContext';
import { SocketContext } from '../../context/SocketContext';
import { axiosPrivate } from 'src/api/axios';


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
          const response: AxiosResponse = await axiosPrivate.post(LOGOUT_PATH);
          socket.disconnect();
            console.log(42);
            console.log(response);
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
    }, [socket]);
    if (isLoading)
        return <Loading/>
  return errMsg ?
    <>
    {snackBar.enqueueSnackbar('Oops something went wrong during logout', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })}
  <Navigate to='/' />
</>
 : 
    <>
    {snackBar.enqueueSnackbar('See you soon :(', {
      variant: "success",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })}
  <Navigate to='/' />
  </>
}

export default Logout;
