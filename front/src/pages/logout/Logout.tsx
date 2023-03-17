import { AxiosResponse } from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import { axiosToken } from 'src/api/axios';
import Loading from '../Loading';
import { useSnackbar } from 'notistack';
import AuthContext from 'src/context/TokenContext';

const LOGOUT_PATH = 'auth/logout'

const Logout = () => {
  const {token, setToken} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errMsg, setErrMsg] = useState<string>();
    
    const snackBar = useSnackbar();
    
    const logout = async() => {
        try {
        const response : AxiosResponse = await (await axiosToken(token!, setToken)).post(LOGOUT_PATH);
        console.log(response);
        }catch(err : any)
        {
            setErrMsg("Oops something went wrong !");
        }
        localStorage.clear();
        setIsLoading(false);
    }

    useEffect(() => {
        logout();
    }, []);
    if (isLoading)
        return <Loading/>
  return errMsg ?
    <>
    {snackBar.enqueueSnackbar('Oops something went wrong', {
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