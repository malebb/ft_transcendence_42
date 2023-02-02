import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import axios from "axios";
import {AxiosResponse} from 'axios';
import { axiosMain } from '../../api/axios';
import Loading from '../Loading';

const VERIF_PATH='/auth/verify'

async function verify(jwt: string)
{
  console.log("jwt = " + jwt)
  try { 
    const response: AxiosResponse = await axios.get('http://localhost:3333/auth/verify',
    {
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    });
    console.log("oogog " + response.data)
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
      const jwt = JSON.parse(sessionStorage.getItem("tokens") || '{}');
      if (jwt) {
        const user = await verify(jwt['access_token']);
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

    {console.log(isAuth)}
  return (
    isAuth ? <Outlet/> : <Navigate to="/signin"/>
  );
}

export default PrivateRoutes;