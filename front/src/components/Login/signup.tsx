
import React from 'react';
import { useRef, useState, useEffect} from 'react';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {axiosMain} from '../../api/axios';
import { Link } from 'react-router-dom';
import { AxiosError, AxiosResponse } from 'axios';

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_@.]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$]).{8,24}$/
const SIGNUP_PATH = '/auth/signup'

const Signup = () => {
  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [user,setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd,setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd,setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // userRef.current.focus();
  }, []);

//TODO change userRef to user in the useeffect if not working
  useEffect(() => {
    const result = USER_REGEX.test(user);
    console.log(result);
    console.log(user);
    setValidName(result);
  }, [user])

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    console.log(result);
    console.log(pwd);
    setValidPwd(result);
    const match = matchPwd === pwd;
    setValidMatch(match);
  }, [pwd, matchPwd])

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd, matchPwd])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2)
    {
      setErrMsg("Invalid Entry");
      return;
    }
    try{
      const response: AxiosResponse = await axiosMain.post(SIGNUP_PATH, {email: user, password: pwd},
      {
        headers: {'Content-Type': 'application/json'},
        //withCredentials: true
      });
      console.log(response.data);
      setSuccess(true);
     // setToken(response.data.token);
      sessionStorage.setItem("tokens", JSON.stringify(response.data));
      console.log(response.data.access_token);
      //console.log(token);
    }catch(err : any)
    {
      if (!err?.response)
      {
        setErrMsg('No Server Response');
      }else if (err.response?.status === 403)
      {
        setErrMsg('Username Taken');
      }else{
        setErrMsg('Registration Failed')
      }
      //errRef.current.focus();
    }
  }

  return (
    <>
    {success? (
      <section>
        <h1>Success!</h1>
        <Link to='/'>Go to Home</Link>
      </section>
    ):(
      <section>
        <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live='assertive'>{errMsg}</p>
        <h1>Sign up</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor='username'>
            Username:
            <span className={validName ? "valid" : "hide"}>
              <FontAwesomeIcon icon={faCheck}/>
            </span>
            <span className={validName || !user ? "hide" : "invalid"}>
              <FontAwesomeIcon icon={faTimes}/>
            </span>
          </label>
          <input 
            type="text"
            id='username'
            ref={userRef}
            autoComplete='off'
            onChange={(e) =>setUser(e.target.value)}
            required
            aria-invalid={validName ? "false" : "true"}
            aria-describedby="uidnote"
            onFocus={() => setUserFocus(true)}
            onBlur={() => setUserFocus(false)}
            />
            <p id="uidnote" className={userFocus && user && !validName ? 'instructions' : 'offscreen'}>
              4 to 24 characters <br/>
              Must begin with a letter.<br/>
              Letters, numbers, underscores, hyphens allowed.
            </p>

          <label htmlFor='password'>
            Password:
            <span className={validPwd ? "valid" : "hide"}>
              <FontAwesomeIcon icon={faCheck}/>
            </span>
            <span className={validPwd || !pwd ? "hide" : "invalid"}>
              <FontAwesomeIcon icon={faTimes}/>
            </span>
          </label>
          <input 
            type="password"
            id='password'
            onChange={(e) =>setPwd(e.target.value)}
            required
            aria-invalid={validPwd ? "false" : "true"}
            aria-describedby="pwdnote"
            onFocus={() => setPwdFocus(true)}
            onBlur={() => setPwdFocus(false)}
            />
            <p id="pwdnote" className={pwdFocus && !validPwd ? 'instructions' : 'offscreen'}>
              8 to 24 characters <br/>
              Must include uppercase and lowercase letters a number and a special charaters.<br/>
            </p>


          <label htmlFor='confirm_password'>
            Confirm Password:
            <span className={validMatch && matchPwd ? "valid" : "hide"}>
              <FontAwesomeIcon icon={faCheck}/>
            </span>
            <span className={validMatch && !matchPwd ? "hide" : "invalid"}>
              <FontAwesomeIcon icon={faTimes}/>
            </span>
          </label>
          <input 
            type="password"
            id='confirm_password'
            onChange={(e) =>setMatchPwd(e.target.value)}
            required
            aria-invalid={validMatch ? "false" : "true"}
            aria-describedby="confirmpwdnote"
            onFocus={() => setMatchFocus(true)}
            onBlur={() => setMatchFocus(false)}
            />
            <p id="confirmpwdnote" className={matchFocus && !validMatch ? 'instructions' : 'offscreen'}>
              Must match the first password<br/>
            </p>
            <button disabled={!validName || !validPwd || !validMatch ? true : false}>Sign up</button>
        </form>
        <div className='signup__div__to_signin'>
            <p>Already have an account?</p>
            <Link className='Signin-Link' to='/signin'>Sign in</Link>
        </div>
      </section> 
    )}
    </>
  )
}

export default Signup;