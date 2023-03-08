import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {Axios, AxiosHeaders} from "axios";
import { AxiosResponse } from "axios";
import { axiosAuthReq, axiosMain, axiosToken, HTTP_METHOD } from "../../api/axios";
import Loading from "../Loading";

const AUTH_VERIF_PATH = "/auth/verify";

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
  const [errMsg, setErrMsg] = useState<string>("");
  const [data, setData] = useState<boolean>();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await axiosAuthReq(HTTP_METHOD.GET, AUTH_VERIF_PATH, {} as AxiosHeaders, {}, setErrMsg, setData);
        if (user !== undefined) 
          setIsAuth(user);
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return <Loading />;
  }

  console.log("err ==" + JSON.stringify(errMsg));

  return isAuth ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoutes;
