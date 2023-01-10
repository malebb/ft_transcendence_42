import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import axios from "axios";
import {AxiosResponse} from 'axios';
import { axiosMain } from '../api/axios';
import Loading from '../Loading';

const VERIF_PATH='/auth/verify'

async function verify(jwt: string)
{
  try { 
    let token = jwt.split(":")[1];
    token = token.substring(1, token.length - 2);
    const response: AxiosResponse = await axios.get('http://localhost:3333/auth/verify',
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    console.log(response.data)
    return response.data;
  }
  catch(err : any){
    console.log('error');
  }
}

const PrivateRoutes = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

 
  useEffect(() =>
  {
    const checkAuth = async () => {
      const jwt = sessionStorage.getItem("token");
      if (jwt) {
        const user = await verify(jwt);
        if (user)
          setIsAuth(true);
      }
      setIsChecking(false);
    };
    checkAuth();
  }, []);
  
  if (isChecking) {
    return <Loading/>;
  }

  return (
    sessionStorage.getItem('token') ? <Outlet/> : <Navigate to="/signin"/>
  );
}

export default PrivateRoutes;