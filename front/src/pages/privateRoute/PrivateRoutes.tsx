import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "../Loading";
import { useSnackbar } from "notistack";
import useAxiosPrivate from "src/hooks/usePrivate";
import AuthContext from "src/context/TokenContext";

const AUTH_VERIF_PATH = "/auth/verify";

const PrivateRoutes = () => {

  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errMsg, setErrMsg] = useState<string>("");
  const axiosPrivate = useAxiosPrivate();

  const {token} = useContext(AuthContext)
  const snackBar = useSnackbar();

  useEffect(() => {
    const checkAuth = async () => {

      try{
        const response = await axiosPrivate.get(AUTH_VERIF_PATH);

        if (response !== undefined) 
          setIsAuth(true);}
          catch (err: any)
          {
            setErrMsg(err.response);
            console.log(err.response);
          }
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return <Loading />;
  }

  if (errMsg === "")
  return isAuth ? <Outlet /> : <Navigate to="/signin" />;
  else
  return (
    <>
    {snackBar.enqueueSnackbar('Oops something went wrong private route', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })}
  <Navigate to='/' />
</>
  )
};

export default PrivateRoutes;
