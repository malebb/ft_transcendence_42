import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { axiosMain } from "src/api/axios";
import useQuery from "../../useQuery";
import { Link, Navigate } from "react-router-dom";
import Loading from "src/pages/Loading";
import { useSnackbar } from "notistack";
import VerifTfa from "src/pages/settings/components/VerifTfa";

const CALLBACK_PATH = "/auth/signin/42login/callback";

//TODO IF NO CODE
const Callback = () => {
  const [errMsg, setErrMsg] = useState("");
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTfa, setIsTfa] = useState<boolean>(false);
  const [TfaSuccess, setTfaSuccess] = useState<boolean>(false);

  const snackBar = useSnackbar();
  const query = useQuery();
  useEffect(() => {
    const code = query.get("code") || "";
    console.log("code = " + code);
    const callback42 = async () => {
      try {
        const response: AxiosResponse = await axiosMain.post(CALLBACK_PATH, {
          code: code,
        });
        console.log("response = " + JSON.stringify(response.data));
        sessionStorage.setItem("id", JSON.stringify(response.data.userId));
        sessionStorage.setItem("tokens", JSON.stringify(response.data.tokens));
        setUsername(response.data.username);
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
  if (isLoading) return <Loading />;
  return (
    <>
      {errMsg ? (
        <>
          {snackBar.enqueueSnackbar("Oops something went wrong", {
            variant: "error",
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
          })}
          <Navigate to={"/signin"} />
        </>
      ) : (
        <>
          {isTfa && <VerifTfa setTfaSuccess={setTfaSuccess} />}
          {(TfaSuccess || !isTfa) && (
            <>
              {snackBar.enqueueSnackbar("Hello, " + username, {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })}
              <Navigate to={"/"} />
            </>
          )}
        </>
      )}
      ;
    </>
  );
};

export default Callback;
