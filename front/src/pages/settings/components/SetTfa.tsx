import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthContext from "src/context/TokenContext";
import { useSnackbar } from "notistack";
import useAxiosPrivate from "src/hooks/usePrivate";

const CODE_REGEX = /^[0-9]{6}$/;

const SetTfa = () => {
  const snackBar = useSnackbar();
  const axiosPrivate = useAxiosPrivate();
  const {token, setToken, userId} = useContext(AuthContext);
  const [TfaQrcode, setTfaQrcode] = useState("");

  const [badAttempt, setBadAttempt] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [validCode, setValidCode] = useState<boolean>(false);

  const navigate = useNavigate();
  useEffect(() => {
    const result = CODE_REGEX.test(code);
    setValidCode(result);
  }, [code]);

  useEffect(() => {
    const createQrCode = async () => {
      setTfaQrcode(
        (
          await axiosPrivate.get("/auth/create2FA")
        ).data
        //qrcode.toDataURL(secret.otpauth_url,{type: "image/jpeg"}/*, function(err: any, data: any){
      );
    };
    createQrCode();
  }, []);

  const onCodeChange = (event: any) => {
    setCode(event.target.value);
    if (badAttempt) setBadAttempt(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
    const verif = (
      await axiosPrivate.post(
        "/auth/verify2FA",
        { code: code, userId: userId },
      )
    ).data;
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    if (verif === true) {
        await axiosPrivate.get("/auth/set2FA");
        navigate("/user");
    } else setBadAttempt(true);
    console.log("verif code =======" + verif);
  }
  catch(err: any)
  {
    return (
    <>
    {snackBar.enqueueSnackbar('Oops something went wrong', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })}
  <Navigate to='/user' />
</>
    )
  }
  };

  return (
    <>
      <div>SetTfa</div>
      {badAttempt ? <div>Attempt failed</div> : <></>}
      <img alt="2FA_QRCode" src={TfaQrcode} />
      <form onSubmit={handleCodeSubmit}>
        <label htmlFor="avatar">2FA:</label>
        <input
          type="text"
          placeholder="Enter the 6 figures code"
          onChange={onCodeChange}
        />
        <button disabled={!validCode ? true : false}>Activate 2FA</button>
      </form>
    </>
  );
};

export default SetTfa;
