import { AxiosResponse } from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { useSnackbar } from 'notistack';
import useAxiosPrivate from 'src/hooks/usePrivate';
import Cookies from 'js-cookie';
import AuthContext from 'src/context/TokenContext';

const LOGOUT_PATH = 'auth/logout'

const Logout = () => {
  const axiosPrivate = useAxiosPrivate();
  const context = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errMsg, setErrMsg] = useState<string>();
    
    const snackBar = useSnackbar();
    
    const logout = async() => {
        try {
        const response : AxiosResponse = await axiosPrivate.post(LOGOUT_PATH);
        console.log(response);
        context.setToken(undefined);
        context.setUserId(undefined);
        context.setUsername(undefined);
        }catch(err : any)
        {
            setErrMsg("Oops something went wrong !");
        }
        setIsLoading(false);
    }

    console.log(errMsg);
    useEffect(() => {
        logout();
    }, []);
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

export default Logout