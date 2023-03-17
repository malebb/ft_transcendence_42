import { AxiosResponse } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { axiosToken } from "src/api/axios";
import Loading from "../Loading";
import { useSnackbar } from "notistack";
import { Socket, io } from "socket.io-client";

const LOGOUT_PATH = "auth/logout";

const Logout = () => {
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string>();
  
  const snackBar = useSnackbar();

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io("ws://localhost:3333/user", {
      transports: ["websocket"],
      forceNew: true,
      upgrade: false,
    });
  }, []);

  const logout = async () => {
    try {
      const userSessionId = JSON.parse(sessionStorage.getItem("id")!);
      socket.current!.on("connect", async () => {
        socket.current!.emit("USER_OFFLINE", userSessionId);
        return () => {
          socket.current?.disconnect();
        };
      });
      const response: AxiosResponse = await (
        await axiosToken()
      ).post(LOGOUT_PATH);
      console.log(42);
      console.log(response);
    } catch (err: any) {
      setErrMsg("Oops something went wrong !");
    }
    sessionStorage.clear();
    setIsLoading(false);
  };

  useEffect(() => {
    logout();
  }, []);
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
