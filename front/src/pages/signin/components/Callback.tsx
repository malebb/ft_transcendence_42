import { AxiosResponse } from "axios";
import { useContext, useEffect, useState } from "react";
import { axiosMain } from "src/api/axios";
import useQuery from "../../useQuery";
import { Navigate } from "react-router-dom";
import Loading from "src/pages/Loading";
import { useSnackbar } from "notistack";
import VerifTfa from "src/pages/settings/components/VerifTfa";
import { ResponseInterface, SignInterface } from "src/interfaces/Sign";
import Headers from "src/components/Headers";
import { SocketContext } from '../../../context/SocketContext';
import AuthContext from "src/context/TokenContext";


const CALLBACK_PATH = "/auth/signin/42login/callback";

const Callback = () => {

  const { setToken, setUsername, setUserId} = useContext(AuthContext);
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTfa, setIsTfa] = useState<boolean>(false);
  const [TfaSuccess, setTfaSuccess] = useState<boolean>(false);
  const [TfaDone, setTfaDone] = useState<boolean>(false);
  const socket = useContext(SocketContext);

  const [resp, setResp] = useState<ResponseInterface>({
    tokens: undefined,
    id: undefined,
    username: undefined,
  });

  const snackBar = useSnackbar();
  const query = useQuery();
  useEffect(() => {
	
    const callback42 = async () => {
    	const code = query.get("code") || "";
      try {
        const response: AxiosResponse = await axiosMain.post<SignInterface>(CALLBACK_PATH, {
          code: code,
        }, { withCredentials: true,  headers: {
          // "Access-Control-Allow-Origin": "*",
          // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
          "Content-Type": "application/json"
        }});
      if (response.data.isTfa === false)
      {
        setUsername(response.data.username!);
        setUserId(response.data.userId);
        setToken(response.data.tokens!)
        socket.auth = {token: response.data.tokens!.access_token}
	  	  socket.connect();
        snackBar.enqueueSnackbar("Hello, " + response.data.username!, {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
      }
      else {
        setResp((prev) => ({...prev, id: response.data.userId}))
        setResp((prev) => ({...prev, username: response.data.username}))
        setResp((prev) => ({...prev, tokens: response.data.tokens}))
      }
        setIsTfa(response.data.isTfa);
	  	
      } catch (err: any) {
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 403) {

          setErrMsg("Invalid Credentials");
        } else {
          setErrMsg("Registration Failed");
        }
      }
      setIsLoading(false);
    };
    callback42();
  }, [setToken, setUserId, setUsername, socket, snackBar]);

  useEffect(() => {
    if (TfaSuccess)
    {
      setUsername(resp.username!);
      setUserId(resp.id!);
      setToken(resp.tokens!);
      socket.auth = {token: resp.tokens!.access_token}
	  	socket.connect();
      setTfaDone(true);
      snackBar.enqueueSnackbar("Hello, " + resp.username!, {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
    }
  }, [TfaSuccess, resp.id, resp.tokens, resp.username, socket, setToken, setUsername, setUserId, snackBar])

  useEffect(() => {
    if (errMsg === 'Invalid Credentials')
    {
      snackBar.enqueueSnackbar("42 Email already used on an other account :(", {
      variant: "error",
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
    })}
    else if (errMsg)
    {
      snackBar.enqueueSnackbar("Oops something went wrong", {
      variant: "error",
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
    })}
  }, [errMsg, snackBar])

  if (isLoading) return <Loading />;
  return (
    <>
    <Headers/>
      {errMsg ? (
          <Navigate to={"/signin"} />
      ) : (
        <main>
          {(isTfa && resp.id !== undefined) && <VerifTfa setTfaSuccess={setTfaSuccess} userId={resp.id} />}
          {(TfaDone || !isTfa) && (
              <Navigate to={"/user"} />
          )}
        </main>
      )}
    </>
  );
};

export default Callback;
