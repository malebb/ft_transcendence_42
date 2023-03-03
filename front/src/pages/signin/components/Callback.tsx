import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { axiosMain } from "src/api/axios";
import useQuery from "../../useQuery";
import { Link } from "react-router-dom";
import Loading from "src/pages/Loading";

const CALLBACK_PATH = "/auth/signin/42login/callback";

//TODO IF NO CODE
const Callback = () => {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        sessionStorage.setItem("tokens", JSON.stringify(response.data.tokens));
        sessionStorage.setItem("id", JSON.stringify(response.data.userId));
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
  if (isLoading)
    return (
      <Loading/>
    );
  return (
    <>
      {errMsg ? (
        <>
          <div>{errMsg}</div>
          <Link to="/">Go to Home</Link>
        </>
      ) : (
        <>
          <div>Callback</div>
          <Link to="/">Go to Home</Link>
        </>
      )}
    </>
  );
};

export default Callback;
