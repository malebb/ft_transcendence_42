import React from "react";
import { useRef, useState, useEffect, useContext } from "react";
import {
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { axiosMain } from "../../api/axios";
import { Link, Navigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import '../../styles/signup.css'
import Headers from "src/components/Headers";
import { SocketContext } from '../../context/SocketContext';
import AuthContext from "src/context/TokenContext";
// eslint-disable-next-line
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
// eslint-disable-next-line
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*^()-_=]).{8,24}$/;
const SIGNUP_PATH = "/auth/signup";

const Signup = () => {
  const userRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const {setToken, setUsername, setUserId} = useContext(AuthContext);
  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const socket = useContext(SocketContext);

  const snackBar = useSnackbar();
  useEffect(() => {
    emailRef.current!.focus();
  }, []);

  //TODO change userRef to user in the useeffect if not working
  useEffect(() => {
    const result = USER_REGEX.test(user);
    setValidName(result);
  }, [user]);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    setValidPwd(result);
    const match = matchPwd === pwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v0 = EMAIL_REGEX.test(email)
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v0 || !v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      const response: AxiosResponse = await axiosMain.post(
        SIGNUP_PATH,
        { email: email, username: user, password: pwd },
        { withCredentials: true,  headers: {
          "Content-Type": "application/json"
        }}
      );
      setSuccess(true);
      setUsername(response.data.username!);
      setUserId(response.data.userId!);
      setToken(response.data.tokens!)
      socket.auth = {token: response.data.tokens!.access_token}
	    socket.connect();
      snackBar.enqueueSnackbar("Hello, " + response.data.username!, {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg(err.response?.data?.message);
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current!.focus();
    }
  };

  return (
    <>
      {success ? (
              <Navigate to={"/"}/>
      ) : (
        <>
        <Headers/>
        <main>
        <section className="sign-section">
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <h1 className="signup-title">Sign up</h1>
          <form className="sign-form" onSubmit={handleSubmit}>
            <label htmlFor="email" className="hide">
              Email:
              <span className={validEmail ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validEmail || !email ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
            className="signup_input"
              placeholder="email"
              type="text"
              id="email"
              ref={emailRef}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
            <p
              id="uidnote"
              className={
                emailFocus && email && !validEmail ? "instructions" : "offscreen"
              }
            >
              Enter a valid Email <br />
            </p>
            <label htmlFor="username" className="hide">
              Username:
              <span className={validName ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validName || !user ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
            className="signup_input"
              type="text"
              id="username"
              placeholder="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              required
              aria-invalid={validName ? "false" : "true"}
              aria-describedby="uidnote"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
            />
            <p
              id="uidnote"
              className={
                userFocus && user && !validName ? "instructions" : "offscreen"
              }
            >
              4 to 24 characters <br />
              Must begin with a letter.
              <br />
              Letters, numbers, underscores, hyphens allowed.
            </p>

            <label htmlFor="password" className="hide">
              Password:
              <span className={validPwd ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validPwd || !pwd ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
            placeholder="password"
            // className={validPwd ? "valid_input" : "signup_input"}
            className="signup_input"
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              required
              aria-invalid={validPwd ? "false" : "true"}
              aria-describedby="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />
            <p
              id="pwdnote"
              className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
            >
              8 to 24 characters <br />
              Must include at least one :<br /> - Uppercase and lowercase letters. <br/> - Number <br/> - Special charaters.
              <br />
            </p>

            <label htmlFor="confirm_password" className="hide">
              Confirm Password:
              <span className={validMatch && matchPwd ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validMatch && !matchPwd ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
            className="signup_input"
            placeholder="confirm password"
              type="password"
              id="confirm_password"
              onChange={(e) => setMatchPwd(e.target.value)}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmpwdnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <p
              id="confirmpwdnote"
              className={
                matchFocus && !validMatch ? "instructions" : "offscreen"
              }
            >
              Must match the first password
              <br />
            </p>
            <button
              className="btn btn-transparent signin_btn"
              disabled={!validName || !validPwd || !validMatch ? true : false}
            >
              Sign up
            </button>
          </form>
          <div className="signup_div_signin">
            <p>Already have an account?</p>
            <Link className="Signup-Link" to="/signin">
              Sign in
            </Link>
          </div>
        </section>
        </main>
        </>
      )}
    </>
  );
};

export default Signup;
