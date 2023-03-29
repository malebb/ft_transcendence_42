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

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}
  useEffect(() => {
    async function checkBadAttempt()
    {
    if(badAttempt)
    {
      await timeout(700);
      setBadAttempt(false);
    }}

    checkBadAttempt();
  }, [badAttempt])
  // const onCodeChange = (event: any) => {
  //   setCode(event.target.value);
  //   if (badAttempt) setBadAttempt(false);
  // };

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
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    if (verif === true) {
        await axiosPrivate.get("/auth/set2FA");
        navigate("/user");
    } else setBadAttempt(true);
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

  const handleNextInput = (e : React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
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
    if(nextSibiling !== null){
        nextSibiling.focus();
    }}
    e.target.placeholder = e.target.value;
    // setCode(code + e.target.value);
  };
  return (
    <>
      {/* <div>SetTfa</div>
      {badAttempt ? <div>Attempt failed</div> : <></>} */}

    <div className="tfa_container">
      <img className="tfa_qrcode" alt="2FA_QRCode" src={TfaQrcode} />
        <input className="tfa_checkbox" id="submitted" type="checkbox" tabIndex={-1}/>

<form className={badAttempt? "tfa-form bad_attempt" : "tfa-form"} onSubmit={handleCodeSubmit}>

	<input className="tfa-number-input" type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n1" name="n1" autoFocus/>
	<input className="tfa-number-input" type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n2" name="n2"/>
	<input className="tfa-number-input" type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n3" name="n3"/>
	<input className="tfa-number-input" type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n4" name="n4"/>
	<input className="tfa-number-input" type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n5" name="n5"/>
	<input className="tfa-number-input" type="number" onChange={(e) => { handleNextInput(e) }} min="0" max="9" maxLength={1} placeholder=" " id="n6" name="n6"/>

	<button className="submit" itemType="button" tabIndex={1}  id="n7"></button>

	<span className="indicator"></span>

</form>
    </div>
      {/* <form onSubmit={handleCodeSubmit}>
        <label htmlFor="avatar">2FA:</label>
        <input
          type="text"
          placeholder="Enter the 6 figures code"
          onChange={onCodeChange}
        />
        <button disabled={!validCode ? true : false}>Activate 2FA</button>
      </form> */}
    </>
  );
};

export default SetTfa;
