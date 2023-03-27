import { AxiosResponse } from "axios";
import { useEffect, useState, useContext } from "react";
import { axiosMain } from "src/api/axios";
import useQuery from "../../useQuery";
import { Navigate } from "react-router-dom";
import Loading from "src/pages/Loading";
import { useSnackbar } from "notistack";
import VerifTfa from "src/pages/settings/components/VerifTfa";
import { ResponseInterface, SignInterface } from "src/interfaces/Sign";
import Headers from "src/components/Headers";
import { SocketContext } from '../../../context/SocketContext';
import { getToken } from '../../../api/axios';

const CALLBACK_PATH = "/auth/signin/42login/callback";

//TODO IF NO CODE
const Callback = () => {
  const [errMsg, setErrMsg] = useState("");
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTfa, setIsTfa] = useState<boolean>(false);
  const [TfaSuccess, setTfaSuccess] = useState<boolean>(false);
  const socket = useContext(SocketContext);
  const [resp, setResp] = useState<ResponseInterface>({
    tokens: undefined,
    id: undefined,
  });

  const snackBar = useSnackbar();
  const query = useQuery();
  useEffect(() => {
    const code = query.get("code") || "";
    const callback42 = async () => {
      try {
        const response: AxiosResponse = await axiosMain.post<SignInterface>(CALLBACK_PATH, {
          code: code,
        });
      if (response.data.isTfa === false)
      {
        sessionStorage.setItem("tokens", JSON.stringify(response.data.tokens));
        sessionStorage.setItem("id", JSON.stringify(response.data.userId));
      }
      else {
        setResp((prev) => ({...prev, id: response.data.userId}))
        setResp((prev) => ({...prev, tokens: response.data.tokens}))
      }
        setUsername(response.data.username);
        setIsTfa(response.data.isTfa);
	  	socket.auth = {token: getToken().access_token}
	  	socket.connect();
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
  }, []);

  useEffect(() => {
    if (TfaSuccess)
    {
      sessionStorage.setItem("tokens", JSON.stringify(resp.tokens));
      sessionStorage.setItem("id", JSON.stringify(resp.id));
    }
  }, [TfaSuccess])

  if (isLoading) return <Loading />;
  return (
    <>
    <Headers/>
      {errMsg ? (
        <>
          {snackBar.enqueueSnackbar("Oops something went wrong", {
            variant: "error",
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
          })}
          <Navigate to={"/signin"} />
        </>
      ) : (
        <main>
          {(isTfa && resp.id !== undefined) && <VerifTfa setTfaSuccess={setTfaSuccess} userId={resp.id} />}
          {(TfaSuccess || !isTfa) && (
            <>
              {snackBar.enqueueSnackbar("Hello, " + username, {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })}
              <Navigate to={"/"} />
            </>
          )}
        </main>
      )}
    </>
  );
};

export default Callback;
