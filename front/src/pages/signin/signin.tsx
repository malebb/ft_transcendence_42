import React from "react";
import "../../styles/signin.css";
import { useRef, useState, useEffect, useContext } from "react";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { axiosMain } from "../../api/axios";
import { Link, Navigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import TokenContext from "../../context/TokenContext";
import VerifTfa from "../settings/components/VerifTfa";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Headers from "src/components/Headers";
import "../../styles/VerifTfa.css";
import { SocketContext } from '../../context/SocketContext';
import { getToken } from '../../api/axios';

const EMAIL_REGEX = /^[a-z0-9-_@.]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$]).{8,24}$/;
const SIGNIN_PATH = "/auth/signin";

interface TokensInterface{
    access_token: string,
    crea_time: Date,
    expireIn: number,
    refresh_token: string,
  }
interface ResponseInterface{
  tokens: TokensInterface | undefined,
  id: number | undefined,
}

interface SignInterface {
  tokens: TokensInterface;
  isTfa: boolean;
  userId: number;
  username: string;
}

const Signin = () => {
  const { token = "", setToken = () => {} } =
    React.useContext(TokenContext) ?? [];

  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [resp, setResp] = useState<ResponseInterface>({
    tokens: undefined,
    id: undefined,
  });
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [name, setName] = useState<string>("");

  const [isTfa, setIsTfa] = useState<boolean>(false);
  const [TfaSuccess, setTfaSuccess] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const snackBar = useSnackbar();
  const socket = useContext(SocketContext);

  useEffect(() => {
    // userRef.current.focus();
  }, []);

  //TODO change userRef to user in the useeffect if not working
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    console.log(result);
    console.log(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    console.log(result);
    console.log(pwd);
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
        {
          headers: { "Content-Type": "application/json" },
          //withCredentials: true
        }
      );

//	  console.log('socket = ', socket);
      setSuccess(true);
      setToken(response.data.token);
      setIsTfa(response.data.isTfa);
      setName(response.data.username);
      console.log("tfa === " + JSON.stringify(response.data));
      console.log("tfa ==" + response.data.isTfa);
      if (response.data.isTfa === false)
      {
      sessionStorage.setItem("tokens", JSON.stringify(response.data.tokens));
      sessionStorage.setItem("id", JSON.stringify(response.data.userId));
      }
      else {
        setResp((prev) => ({...prev, id: response.data.userId}))
        setResp((prev) => ({...prev, tokens: response.data.tokens}))
      }
	  socket.auth = {token:getToken().access_token}
	  //socket.on('connect', () => {
		//	socket.emit('ONLINE');
	  //})
	  socket.connect();
	  console.log('my socket = ', socket);
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Registration Failed");
      }
      //errRef.current.focus();
    }
  };
  useEffect(() => {
    if (TfaSuccess)
    {
      sessionStorage.setItem("tokens", JSON.stringify(resp.tokens));
      sessionStorage.setItem("id", JSON.stringify(resp.id));
    }

  }, [TfaSuccess])

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
      {success ? (
        <section>
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
        </section>
      ) : (
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
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
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
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />

            <button className="btn btn-transparent" disabled={!validEmail || !validPwd ? true : false}>
              Sign in
            </button>
          </form>
          <div>
            <button
              className="btn btn-transparent"
              type="button"
              onClick={() =>
                (window.location.href =
                  "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ecce62647daf96b7bacb9e099841e3bf1c1cd04a5c5a259d4e5ff2b983d248b2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsignin%2F42login%2Fcallback&response_type=code")
              }
            >
              <img
                alt="42_logo"
                src="https://upload.wikimedia.org/wikipedia/commons/8/8d/42_Logo.svg"
                width="60"
              />
              {/* <a href='https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ecce62647daf96b7bacb9e099841e3bf1c1cd04a5c5a259d4e5ff2b983d248b2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsignin%2F42login%2Fcallback&response_type=code'>LOGIN AS STUDENT</a> */}
            </button>
          </div>
          <div className="signup_div_signin">
            <p>Don't have an account?</p>
            <Link className="Signup-Link" to="/signup">
              Sign up
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Signin;
