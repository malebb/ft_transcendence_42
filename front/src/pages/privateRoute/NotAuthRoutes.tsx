
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {Axios, AxiosHeaders} from "axios";
import { AxiosResponse } from "axios";
import { axiosAuthReq, axiosMain, axiosToken, HTTP_METHOD } from "../../api/axios";
import Loading from "../Loading";
import { Snackbar } from "@mui/material";
import { useSnackbar } from "notistack";

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

  const snackBar = useSnackbar();

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
  console.log("user ==" + JSON.stringify(data));

  return isAuth ? 
    <>
    {snackBar.enqueueSnackbar('Oops something went wrong', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })}
  <Navigate to='/' />
</>
 : <Outlet />;
};

export default PrivateRoutes;
