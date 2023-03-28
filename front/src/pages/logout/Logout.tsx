import { AxiosResponse } from "axios";
import React, { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { axiosToken } from "src/api/axios";
import Loading from "../Loading";
import { useSnackbar } from "notistack";
import { SocketContext } from '../../context/SocketContext';

const LOGOUT_PATH = "auth/logout";

const Logout = () => {
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string>();
  const socket = useContext(SocketContext);
  
  const snackBar = useSnackbar();


  useEffect(() => {
  	const logout = async () => {
   	 try {
   	   const response: AxiosResponse = await (
   	     await axiosToken() ).post(LOGOUT_PATH);
		 	 socket.disconnect();
	      	console.log(42);
	      	console.log(response);
	    }
		catch (err: any) {
    	  setErrMsg("Oops something went wrong !");
    	}
    	sessionStorage.clear();
    	setIsLoading(false);
  	};
    logout();
  }, [socket]);
  if (isLoading) return <Loading />;
  return errMsg ? (
    <>
      {snackBar.enqueueSnackbar("Oops something went wrong", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      })}
      <Navigate to="/" />
    </>
  ) : (
    <>
      {snackBar.enqueueSnackbar("See you soon :(", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      })}
      <Navigate to="/" />
    </>
  );
};

export default Logout;
