import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { axiosMain, axiosPrivate, axiosToken } from "../../../api/axios";
import axios, { AxiosResponse } from "axios";
import AuthContext from "src/context/TokenContext";

const CODE_REGEX = /^[0-9]{6}$/;

const Tfa = () => {
  const {token, setToken, userId} = useContext(AuthContext);
  const [code, setCode] = useState("");
  const [validCode, setValidCode] = useState<boolean>(false);

  useEffect(() => {
    const result = CODE_REGEX.test(code);
    console.log(result);
    console.log(code);
    setValidCode(result);
  }, [code]);

  const onCodeChange = (event: any) => {
    setCode(event.target.value);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("here");
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
    console.log("verif code =======" + verif);
    //setVerified(verif);
  };
  return (
    <div>
      <form onSubmit={handleCodeSubmit}>
        <label htmlFor="avatar">2FA:</label>
        <input
          type="text"
          placeholder="Enter the 6 figures code"
          onChange={onCodeChange}
        />
        <button disabled={!validCode ? true : false}>Activate 2FA</button>
      </form>
      Tfa
    </div>
  );
};

export default Tfa;
