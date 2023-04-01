import React, { Dispatch, SetStateAction, useContext, useRef } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "src/hooks/usePrivate";
import { useSnackbar } from "notistack";

const CODE_REGEX = /^[0-9]{6}$/;

const VerifTfa = ({setTfaSuccess, userId} : {setTfaSuccess : Dispatch<SetStateAction<boolean>>, userId: number}) => {
  const axiosPrivate = useAxiosPrivate();


  const [badAttempt, setBadAttempt] = useState<boolean>(false);
  const [disablePush, setDisablePush] = useState<boolean>(true);

  const [cells, setCells] = useState<string[]>(["", "", "", "", "", ""]);

  const snackBar = useSnackbar();
  
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

  const handleCodeSubmit = async (e: any) => {
    e.preventDefault();
    try{
    const verif = (
      await axiosPrivate.post(
        "/auth/verify2FA",
        { code: cells.join(''), userId: userId },
      )
    ).data;
    if (verif === true) {
      setTfaSuccess(true);
    } else {
      setBadAttempt(true);
    };
  }catch(err)
  {
    snackBar.enqueueSnackbar('Oops something went wrong', {
      variant: "error",
      anchorOrigin: {vertical: "bottom", horizontal: "right"}
    })
  }
  };

  useEffect(() => {
    console.log(cells);
    if (cells.every(cell => (cell >= '0' && cell <= '9')) && CODE_REGEX.test(cells.join('')))
      setDisablePush(false);
    else
      setDisablePush(true);
  }, [cells])

  useEffect(() => {
    if (!disablePush)
    {
      const nextSibiling = document.getElementById(`n6`);
      if(nextSibiling !== null){
        nextSibiling.focus();
      }
    }
  }, [disablePush])

  const handleNextInput = (e : React.ChangeEvent<HTMLInputElement>, indexToUpdate: number) => {
    console.log(indexToUpdate);
    e.preventDefault();
    if (Object.keys(e.target.value).length > 1)
    {
      if(e.target.value[0] !== e.target.placeholder)
        (e.target.value = e.target.value[0]);
      else
        (e.target.value = e.target.value[1]);
    }
      setCells((prevCells) => 
        prevCells.map((cell, idx) =>
        idx === indexToUpdate ? e.target.value : cell
      )
      );
    if (e.target.value !== "")
    {
    const fieldName = e.target.id.split('n')[1];
    const nextSibiling = document.getElementById(`n${parseInt(fieldName) + 1}`);
    if(nextSibiling !== null){
        nextSibiling.focus();
    }}
    e.target.placeholder = e.target.value;
  };
  return (
    <>
    <div className="tfa_container">
        <input className="tfa_checkbox" id="submitted" type="checkbox" tabIndex={-1}/>

<form className={badAttempt? "tfa-form bad_attempt" : "tfa-form"} onSubmit={handleCodeSubmit}>

      {cells.map((cell, idx) => (
        <input key={idx} className="tfa-number-input" type="number" min="0" max="9" maxLength={1} placeholder=" "  id={'n' + idx} name={'n' + idx} onChange={(e) => {handleNextInput(e, idx)}}/>
      ))}
	<button className="submit" itemType="button" tabIndex={1}  id="n6" disabled={disablePush}></button>

	<span className="indicator"></span>

</form>
    </div>
    </>
  );
};

export default VerifTfa;
