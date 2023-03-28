import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { axiosMain, axiosToken } from "src/api/axios";
import axios, { AxiosResponse } from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import useAxiosPrivate from "src/hooks/usePrivate";
import { useSnackbar } from "notistack";
import AuthContext from "src/context/TokenContext";

const CODE_REGEX = /^[0-9]{6}$/;

const DeleteTfa = () => {
  const axiosPrivate = useAxiosPrivate();
  const { userId } = useContext(AuthContext);
  const [TfaQrcode, setTfaQrcode] = useState("");
  const [boolQrcode, setboolQrcode] = useState<boolean>(false);

  const [badAttempt, setBadAttempt] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [validCode, setValidCode] = useState<boolean>(false);

  const snackBar = useSnackbar();
  const navigate = useNavigate();
  useEffect(() => {
    const result = CODE_REGEX.test(code);
    setValidCode(result);
  }, [code]);

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
        { code: code, userId: userId},
      )
    ).data;
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    if (verif === true) {
        await axiosPrivate.get("/auth/unset2FA");
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
      <div>DeleteTfa</div>
      {badAttempt ? <div>Attempt failed</div> : <></>}
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

export default DeleteTfa;
