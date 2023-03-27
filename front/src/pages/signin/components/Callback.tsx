import { AxiosResponse } from "axios";
import { useContext, useEffect, useState } from "react";
import { axiosMain } from "src/api/axios";
import useQuery from "../../useQuery";
import { Link, Navigate } from "react-router-dom";
import Loading from "src/pages/Loading";
import { useSnackbar } from "notistack";
import VerifTfa from "src/pages/settings/components/VerifTfa";
import { ResponseInterface, SignInterface } from "src/interfaces/Sign";
import Headers from "src/components/Headers";
import AuthContext from "src/context/TokenContext";

const CALLBACK_PATH = "/auth/signin/42login/callback";

//TODO IF NO CODE
const Callback = () => {

  const {token, setToken, username, setUsername, userId, setUserId} = useContext(AuthContext);
  const [errMsg, setErrMsg] = useState("");
  // const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTfa, setIsTfa] = useState<boolean>(false);
  const [TfaSuccess, setTfaSuccess] = useState<boolean>(false);
  const [resp, setResp] = useState<ResponseInterface>({
    tokens: undefined,
    id: undefined,
    username: undefined,
  });

  const snackBar = useSnackbar();
  const query = useQuery();
  useEffect(() => {
    const code = query.get("code") || "";
    console.log("code = " + code);
    const callback42 = async () => {
      try {
        const response: AxiosResponse = await axiosMain.post<SignInterface>(CALLBACK_PATH, {
          code: code,
        }, { withCredentials: true,  headers: {
          // "Access-Control-Allow-Origin": "*",
          // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
          "Content-Type": "application/json"
        }});
        console.log("response =+ " + JSON.stringify(response.data));
      if (response.data.isTfa === false)
      {
        // localStorage.setItem("tokens", JSON.stringify(response.data.tokens));
        // localStorage.setItem("id", JSON.stringify(response.data.userId));
        setUsername(response.data.username!);
        setUserId(response.data.userId);
        setToken(response.data.tokens!)
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
  }, []);

  useEffect(() => {
    if (TfaSuccess)
    {
      // localStorage.setItem("tokens", JSON.stringify(resp.tokens));
      // localStorage.setItem("id", JSON.stringify(resp.id));
      setUsername(resp.username!);
      setUserId(resp.id);
      setToken(resp.tokens!)
    }
  }, [TfaSuccess])

  console.log("resp.id = " + resp.id);
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
