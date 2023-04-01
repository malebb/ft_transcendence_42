import React from "react";
import "../../styles/signin.css";
import { useRef, useState, useEffect, useContext } from "react";
import {
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { axiosMain } from "../../api/axios";
import { Link, Navigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import VerifTfa from "../settings/components/VerifTfa";
import { useSnackbar } from "notistack";
import Headers from "src/components/Headers";
import "../../styles/VerifTfa.css";
import { ResponseInterface } from "src/interfaces/Sign";
import { SocketContext } from '../../context/SocketContext';
import AuthContext from "../../context/TokenContext";

const EMAIL_REGEX = /^[a-z0-9-_@.]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*^()-_=]).{8,24}$/;
const SIGNIN_PATH = "/auth/signin";

interface TokensInterface{
    access_token: string,
    crea_time: Date,
    expireIn: number,
    refresh_token: string,
  }
// interface ResponseInterface{
//   tokens: TokensInterface | undefined,
//   id: number | undefined,
// }

interface SignInterface {
  tokens: TokensInterface;
  isTfa: boolean;
  userId: number;
  username: string;
}

const Signin = () => {
  // const { token = "", setToken = () => {} } =
  //   React.useContext(TokenContext) ?? [];

  const context = useContext(AuthContext);
  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [resp, setResp] = useState<ResponseInterface>({
    tokens: undefined,
    id: undefined,
    username: undefined,
  });
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);

  const [name, setName] = useState<string>("");

  const [isTfa, setIsTfa] = useState<boolean>(false);
  const [TfaSuccess, setTfaSuccess] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const snackBar = useSnackbar();
  const socket = useContext(SocketContext);

  useEffect(() => {
    userRef.current!.focus();
  }, []);

  //TODO change userRef to user in the useeffect if not working
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    setValidPwd(result);
  }, [pwd]);

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  /*const Login42 = async () => {
      /*const response: AxiosResponse = await axiosMain.get('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ecce62647daf96b7bacb9e099841e3bf1c1cd04a5c5a259d4e5ff2b983d248b2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsignin%2F42login%2Fcallback&response_type=code',
        {
          headers: {'Access-Control-Allow-Origin': '*',
          /*'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          'Access-Control-Allow-Credentials': 'true'*/
  // }
  // }
  // );
  // }*/

  const handle42Button = () => {
    window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ecce62647daf96b7bacb9e099841e3bf1c1cd04a5c5a259d4e5ff2b983d248b2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsignin%2F42login%2Fcallback&response_type=code";
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = EMAIL_REGEX.test(email);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      const response: AxiosResponse = await axiosMain.post<SignInterface>(
        SIGNIN_PATH,
        { email: email, password: pwd },
        { withCredentials: true,  headers: {
          // "Access-Control-Allow-Origin": "http://localhost:3000",
          // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Content-Type": "application/json"
        }}
      );
      console.log(response.data);
      // setToken(response.data.token);
      setIsTfa(response.data.isTfa);
      setName(response.data.username);
      if (response.data.isTfa === false)
      {
      // localStoVrage.setItem("tokens", JSON.stringify(response.data.tokens));
      // localStorage.setItem("id", JSON.stringify(response.data.userId));
      context.setUsername(response.data.username!);
      context.setUserId(response.data.userId!);
      context.setToken(response.data.tokens!)
      socket.auth = {token: response.data.tokens!.access_token}
      socket.connect();
      console.log('my socket = ', socket);
      }
      else {
        setResp((prev) => ({...prev, id: response.data.userId}))
        setResp((prev) => ({...prev, username: response.data.username}))
        setResp((prev) => ({...prev, tokens: response.data.tokens}))
      }
      setSuccess(true);
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current!.focus();
    }
  };
  useEffect(() => {
    if (TfaSuccess)
    {
      // locaVlStorage.setItem("tokens", JSON.stringify(resp.tokens));
      // localStorage.setItem("id", JSON.stringify(resp.id));
      context.setUsername(resp.username!);
      context.setUserId(resp.id);
      context.setToken(resp.tokens!)
      socket.auth = {token: resp.tokens!.access_token}
      socket.connect();
    }

  }, [TfaSuccess, context, socket, resp])

  const CSS = `<style>
  button {
    /* padding-top: 100px; */
    width: 100%;
    border: none;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url("https://www.searchpng.com/wp-content/uploads/2019/01/Game-Button-PNG-copy.jpg");
    height: 100%;
    max-width: 1400px;
margin: 0 auto;
position: relative;
  }
 button span {
text-align: left;
position: absolute;
left: 20%;
color: white;
top: 29px;
}
button img{position: relative;
}
</style>`;
  return (
    <>
      <style>{CSS}</style>
      <Headers/>
      {(success)? (
        <main>
          {(isTfa && resp.id !== undefined)&& <VerifTfa setTfaSuccess={setTfaSuccess} userId={resp.id}/>}
          {(TfaSuccess || !isTfa) &&(
            <>
              {snackBar.enqueueSnackbar("Hello, " + name, {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "right" },
              })}
              <Navigate to={"/"}/>
            </>
          )}
        </main>
      ) : (
        <main>
        <section className="sign-section">
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <h1 className="signup-title">Sign in</h1>
          <form className="sign-form" onSubmit={handleSubmit}>
            <label htmlFor="username" className="hide">
              Email:
              <span className={validEmail ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validEmail || !email ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
              type="text"
              className="signup_input"
              placeholder="email"
              id="email"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="uidnote"
            />

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
              type="password"
              className="signup_input"
              placeholder="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              required
              aria-invalid={validPwd ? "false" : "true"}
              aria-describedby="pwdnote"
            />

            <button className="btn btn-transparent signin_btn" disabled={!validEmail || !validPwd ? true : false}>
              Sign in
            </button>
          </form>
          <div>
            {/* <button
              className="btn btn-transparent"
              type="button"
              onClick={handle42Button}
            > */}
              <input type="image"
                draggable='false'
                className="ft_button"
                onClick={handle42Button}
                alt="42_logo"
                src="https://upload.wikimedia.org/wikipedia/commons/8/8d/42_Logo.svg"
                width="60"
              />
              {/* <a href='https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ecce62647daf96b7bacb9e099841e3bf1c1cd04a5c5a259d4e5ff2b983d248b2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsignin%2F42login%2Fcallback&response_type=code'>LOGIN AS STUDENT</a> */}
            {/* </button> */}
          </div>
          <div className="signup_div_signin">
            <p>Don't have an account?</p>
            <Link className="Signup-Link" to="/signup">
              Sign up
            </Link>
          </div>
        </section>
</main>
      )}
    </>
  );
};

export default Signin;
