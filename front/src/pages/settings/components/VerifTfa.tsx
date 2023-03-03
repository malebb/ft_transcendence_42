import React from "react";
import { useState, useEffect } from "react";
import { axiosMain, axiosToken } from "src/api/axios";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

const CODE_REGEX = /^[0-9]{6}$/;

const VerifTfa = () => {
  const [TfaQrcode, setTfaQrcode] = useState("");
  const [boolQrcode, setboolQrcode] = useState<boolean>(false);

  const [badAttempt, setBadAttempt] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [validCode, setValidCode] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  const navigate = useNavigate();
  useEffect(() => {
    const result = CODE_REGEX.test(code);
    console.log(result);
    console.log(code);
    setValidCode(result);
  }, [code]);

  const onCodeChange = (event: any) => {
    setCode(event.target.value);
    if (badAttempt) setBadAttempt(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("jwt = " + getJWT());
    const verif = (
      await axiosMain.post(
        "/auth/verify2FA",
        { code: code },
        {
          headers: { Authorization: "Bearer " + getJWT() },
          //withCredentials: true
        }
      )
    ).data;
    console.log("verif code =======" + verif);
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    if (verif === true) {
      navigate("/");
    } else setBadAttempt(true);
    //setVerified(verif);
  };

  const getJWT = () => {
    const jwt = JSON.parse(sessionStorage.getItem("tokens") || "{}");
    console.log("totokens=" + JSON.stringify(jwt));
    return jwt["access_token"];
  };
  return (
    <>
      <div>VerifTfa</div>
      {badAttempt ? <div>Attempt failed</div> : <></>}
      <form onSubmit={handleCodeSubmit}>
        <label htmlFor="avatar">2FA:</label>
        <input
          type="text"
          placeholder="Enter the 6 figures code"
          onChange={onCodeChange}
        />
        <button disabled={!validCode ? true : false}>Send Code</button>
      </form>
    </>
  );
};

export default VerifTfa;
