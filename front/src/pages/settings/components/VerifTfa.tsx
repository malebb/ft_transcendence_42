import React, { Dispatch, SetStateAction, useRef } from "react";
import { useState, useEffect } from "react";
import { axiosMain, axiosToken } from "src/api/axios";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "src/hooks/usePrivate";
import { useSnackbar } from "notistack";

const CODE_REGEX = /^[0-9]{6}$/;

const VerifTfa = ({setTfaSuccess, userId} : {setTfaSuccess : Dispatch<SetStateAction<boolean>>, userId: number}) => {
  const axiosPrivate = useAxiosPrivate();
  const [TfaQrcode, setTfaQrcode] = useState("");
  const [boolQrcode, setboolQrcode] = useState<boolean>(false);

  const [badAttempt, setBadAttempt] = useState<boolean>(false);

  const [validCode, setValidCode] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  const reftextInput1 = useRef<HTMLInputElement>(null);
  const reftextInput2 = useRef<HTMLInputElement>(null);
  const reftextInput3 = useRef<HTMLInputElement>(null);
  const reftextInput4 = useRef<HTMLInputElement>(null);
  const reftextInput5 = useRef<HTMLInputElement>(null);
  const reftextInput6 = useRef<HTMLInputElement>(null);

  const snackBar = useSnackbar();
  const navigate = useNavigate();
  // useEffect(() => {
  //   const result = CODE_REGEX.test(code);
  //   console.log(result);
  //   console.log(code);
  //   setValidCode(result);
  // }, [code]);

  // const onCodeChange = (event: any) => {
  //   setCode(event.target.value);
  //   if (badAttempt) setBadAttempt(false);
  // };

  console.log("userId verif =" + userId);

  const handleCodeSubmit = async (e: any) => {
    e.preventDefault();
    try{
    let code: string = "";
    code += e.target.n1.value; 
    code += e.target.n2.value; 
    code += e.target.n3.value; 
    code += e.target.n4.value; 
    code += e.target.n5.value; 
    code += e.target.n6.value; 
      
    const verif = (
      await axiosPrivate.post(
        "/auth/verify2FA",
        { code: code, userId: userId },
      )
    ).data;
    console.log("verif code =======" + verif);
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    if (verif === true) {
      setTfaSuccess(true);
    } else setBadAttempt(true);
  }catch(err)
  {
    return (
    <>
    {snackBar.enqueueSnackbar('Oops something went wrong', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })}
</>)
  }
    //setVerified(verif);
  };

  const handleNextInput = (e : React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log("ID atual: " + e.target.id);
    console.log("length =" + Object.keys(e.target.value).length)
    console.log("key =" + e.target.placeholder);
    if (Object.keys(e.target.value).length > 1)
    {
      if(e.target.value[0] !== e.target.placeholder)
      (e.target.value = e.target.value[0]);
      else
      (e.target.value = e.target.value[1]);
    }
    if (e.target.value !== "")
    {
    const fieldName = e.target.id.split('n')[1];
    const nextSibiling = document.getElementById(`n${parseInt(fieldName) + 1}`);
    console.log(nextSibiling);
    if(nextSibiling !== null){
        nextSibiling.focus();
    }}
    e.target.placeholder = e.target.value;
    // setCode(code + e.target.value);
  };
  return (

/* <div>VerifTfa</div>
      {badAttempt ? <div>Attempt failed</div> : <></>}
      <form onSubmit={handleCodeSubmit}>
        <label htmlFor="avatar">2FA:</label>
        <input
          type="text"
          placeholder="Enter the 6 figures code"
          onChange={onCodeChange}
        />
        <button disabled={!validCode ? true : false}>Send Code</button>
      </form> */

    <>
        <input id="submitted" type="checkbox" tabIndex={-1}/>

<form onSubmit={handleCodeSubmit}>

	<input type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n1" name="n1" autoFocus/>
	<input type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n2" name="n2"/>
	<input type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n3" name="n3"/>
	<input type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n4" name="n4"/>
	<input type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n5" name="n5"/>
	<input type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n6" name="n6"/>

	<button className="submit" itemType="button" tabIndex={1}  id="n7" disabled></button>

	<span className="indicator"></span>

</form>
    </>
  );
};

export default VerifTfa;
