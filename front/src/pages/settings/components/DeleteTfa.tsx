import React from "react";
import { useState, useEffect } from "react";
import { axiosMain, axiosToken } from "src/api/axios";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

const CODE_REGEX = /^[0-9]{6}$/;

const DeleteTfa = () => {
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
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    if (verif === true) {
      const check = (
        await axiosMain.get("/auth/unset2FA", {
          headers: { Authorization: "Bearer " + getJWT() },
          //withCredentials: true
        })
      ).data;
      navigate("/user");
    } else setBadAttempt(true);
    console.log("verif code =======" + verif);
    //setVerified(verif);
  };

  const getJWT = () => {
    const jwt = JSON.parse(sessionStorage.getItem("tokens") || "{}");
    return jwt["access_token"];
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
