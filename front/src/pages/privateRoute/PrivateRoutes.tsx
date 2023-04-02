import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "../Loading";
import { useSnackbar } from "notistack";
import useAxiosPrivate from "src/hooks/usePrivate";

const AUTH_VERIF_PATH = "/auth/verify";

const PrivateRoutes = () => {

  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errMsg, setErrMsg] = useState<string>("");
  const axiosPrivate = useAxiosPrivate();

  const snackBar = useSnackbar();

  useEffect(() => {
    const checkAuth = async () => {

      try{
        console.log('ici commence le private routes');
        const response = await axiosPrivate.get(AUTH_VERIF_PATH);

        if (response !== undefined) 
          setIsAuth(true);}
          catch (err: any)
          {
            setErrMsg(err.response);
          }
      setIsChecking(false);
    };
    checkAuth();
  }, [axiosPrivate]);


  useEffect(() => {
    if (errMsg !== "")
    {
      snackBar.enqueueSnackbar('Oops something went wrong', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
      });
    }
  }, [errMsg, snackBar]);

  if (isChecking) {
    return <Loading />;
  }

  if (errMsg === "")
  return isAuth ? <Outlet /> : <Navigate to="/signin" />;
  else
  return <Navigate to='/' />
};

export default PrivateRoutes;
