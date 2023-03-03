import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { AxiosResponse } from "axios";
import { axiosMain, axiosToken } from "../../api/axios";
import Loading from "../Loading";

const VERIF_PATH = "/auth/verify";

async function verify() {
  try {
    const response: AxiosResponse = await (await axiosToken()).get(
      "http://localhost:3333/auth/verify");
    return response.data;
  } catch (err: any) {
    console.log("error");
  }
}

const PrivateRoutes = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
        const user = await verify();
        if (user) setIsAuth(true);
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return <Loading />;
  }

  {
    console.log(isAuth);
  }
  return isAuth ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoutes;
