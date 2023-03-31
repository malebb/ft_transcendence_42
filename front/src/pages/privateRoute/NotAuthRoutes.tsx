
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AxiosHeaders} from "axios";
import { axiosAuthReq, HTTP_METHOD } from "../../api/axios";
import Loading from "../Loading";
import { useSnackbar } from "notistack";

const AUTH_VERIF_PATH = "/auth/verify";


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

  if (isChecking) return <Loading />;

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
