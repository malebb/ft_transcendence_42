
import React from 'react';
import { useRef, useState, useEffect} from 'react';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const USER_REGEX = /^[a-zA-Z][a-ZA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_-=]).{8,24}$/
const Login = () => {
  const userRef = useRef<HTMLInputElement>();
  const errRef = useRef();

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
    userRef.current.focus();
  }, []);

//TODO change userRef to user in the useeffect if not working
  useEffect(() => {
    const result = USER_REGEX.test(userRef.current.value);
    console.log(result);
    console.log(userRef.current.value);
    setValidName(result);
  }, [userRef])

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
  }, [userRef.current.value, pwd, matchPwd])


  return (
    <section>
      <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live='assertive'>{errMsg}</p>
      <h1>Signup</h1>
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
   </section> 
  )
}

export default Login