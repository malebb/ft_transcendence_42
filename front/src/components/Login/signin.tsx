import React from 'react';
import '../../styles/signin.css';
import Signup from './signup';
import { useRef, useState, useEffect, useContext} from 'react';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {axiosMain} from '../../api/axios';
import { Link } from 'react-router-dom';
import { AxiosError, AxiosResponse } from 'axios';
import TokenContext from '../../context/TokenContext';
import { setTokenSourceMapRange } from 'typescript';
import Tfa from '../Tfa';
import VerifTfa from '../VerifTfa';
import SetTfa from '../SetTfa';
import { useNavigate } from 'react-router-dom';

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_@.]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$]).{8,24}$/
const SIGNIN_PATH = '/auth/signin'

const Signin = () => {

  const {token = '', setToken = () => {},} = React.useContext(TokenContext) ?? []; 

  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [user,setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd,setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [isTfa, setIsTfa] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

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
  }, [pwd])

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd])

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
      const response: AxiosResponse = await axiosMain.post(SIGNIN_PATH, {email: user, password: pwd},
      {
        headers: {'Content-Type': 'application/json'},
        //withCredentials: true
      });
      console.log(response.data);
      setSuccess(true);
      setToken(response.data.token);
      setIsTfa(response.data.isTfa);
      console.log("tfa === " + JSON.stringify(response.data));
      sessionStorage.setItem("tokens", JSON.stringify(response.data.tokens));
      console.log(response.data.access_token);
      console.log(token);
      if (response.data.isTfa === false)
        navigate('/');
      else
        navigate('/2faverif');
    }catch(err : any)
    {
      if (!err?.response)
      {
        setErrMsg('No Server Response');
      }else if (err.response?.status === 403)
      {
        setErrMsg('Invalid Credentials');
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
        {isTfa &&
          <VerifTfa/>
        }
        {!isTfa && 
          <div>
            <h1>Success!</h1>
            <Link to='/'>Go to Home</Link>
          </div>
        }
      </section>
    ):(
      <section>
        <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live='assertive'>{errMsg}</p>
        <h1>Sign in</h1>
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

            <button disabled={!validName || !validPwd ? true : false}>Sign in</button>
        </form>
        <div className='signin__div__to_signup'>
            <p>Don't have an account?</p>
            <Link className='Signup-Link' to='/signup'>Sign up</Link>
        </div>
      </section> 
    )}
    </>
  )
}

export default Signin;