import React, { useContext } from "react";
import { axiosMain, axiosAuthReq, HTTP_METHOD } from "../../api/axios";
import { AxiosHeaders, AxiosResponse } from "axios";
import { useState, useEffect, useRef } from "react";
import { Switch } from "@mui/material";
import '../../styles/User.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { SvgIcon } from "@mui/material";
//var speakeasy = require('speakeasy');
//var qrcode = require('qrcode');
// import qrcode from 'qrcode';
// import { createSecretKey } from 'crypto';
import { useNavigate } from "react-router-dom";
import Popup from "src/components/Popup";
import Sidebar from "src/components/Sidebar";
import Headers from "src/components/Headers";
import AuthContext from "src/context/TokenContext";
import useAxiosPrivate from "src/hooks/usePrivate";
//var qrcode = require('qrcode');
window.Buffer = window.Buffer || require("buffer").Buffer;

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_@.]{3,23}$/;
const CODE_REGEX = /^[0-9]{6}$/;
const PATCH_PATH = "/users/patchme";
const DEFAULT_IMG = "default_profile_picture.png";
const GET_PROFILE_PICTURE = "http://localhost:3333/users/profile-image/";
const GETME_PATH = "/users/me/";

type UserType = {
  username: string;
  profilePicture: string;
  id: number;
  isTFA: boolean;
};
//TODO add snack bar on update success, modif tfa success, delete success and fail
//TODO gerer les pb de meme username etc
/*const secret = speakhexgenerateSecret({
  name: "broMagicBasketIsSuchAMovie"
})

if (secret.otpauth_url !== undefined)
  var qrcode_img = qrcode.toDataURL(secret.otpauth_url, function(err: any, data: any){
  if (err) return err;
})
console.log(qrcode_img);*/
// const getPic = async (jwt: string) => {
//   try {
//     console.log("jwt = " + jwt);
//     const response: AxiosResponse = await axios.get(
//       "http://localhost:3333/users/profile-image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.pnge5ac4441-06e8-4956-9e34-0941006e7bf8.png",
//       {
//         headers: {
//           Authorization: "Bearer " + jwt,
//         },
//       }
//     );
//     console.log("getPic = " + response.data);
//     return response.data;
//   } catch (err: any) {
//     console.log("error getPic");
//     return null;
//   }
// };
// function validURL(str: string) {
//   var pattern = new RegExp(
//     "^(https?:\\/\\/)?" + // protocol
//       "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
//       "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
//       "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
//       "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
//       "(\\#[-a-z\\d_]*)?$",
//     "i"
//   ); // fragment locator
//   return !!pattern.test(str);
// }

/*<form onSubmit={handleSubmit}>
        <label htmlFor='username'>
          Username:
        </label>
        <input
          type="text"
          id='username'
          ref={userRef}
          autoComplete='off'
          onChange={(e) =>setUserChange(e.target.value)}
          required
          TODO complete the input attribute
        />
        <img src="http://localhost:3333/users/profile-image/" alt='profile-picture'/>
        </form> */
const User = () => {
  const axiosPrivate = useAxiosPrivate();
  const {username} = useContext(AuthContext);
  const [user, setUser] = useState<UserType>();
  const [validUser, setValidUser] = useState<boolean>(false);
  const [picture, setPicture] = useState("");

  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTFA, setIsTFA] = useState<boolean>(false);

  const [code, setCode] = useState("");
  const [validCode, setValidCode] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [modelDisplay, setModelDisplay] = useState<boolean>(false);
  const [modelContent, setModelContent] = useState<string>("");
  const [handleConfirm, setHandleConfirm] = useState<() => void>();
  const [pathConfirm, setPathConfirm] = useState<string>("");

  const [Login, setLogin] = useState("");
  const [validLogin, setValidLogin] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState("");

  const myRef = useRef<HTMLInputElement>(null);

  const popupTitle = "WARNING";
  const popupChangeContent =
    "Are you sure you want to change your 2FA code ? This action is final and after validating the process you want be able to use it anymore";
  const popupDeleteContent =
    "Are you sure you want to delete your 2FA code ? This action is final and after validating the process you want be able to use it anymore";
  function validURL(str: string) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }

  useEffect(() => {
    const result = CODE_REGEX.test(code);
    console.log(result);
    console.log(code);
    setValidCode(result);
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (selectedFile === undefined)
      console.log("selectedFile is undef");
    if (selectedFile !== null) {
      console.log("good file");
      console.log(selectedFile)
      formData.append("file", selectedFile);
    }
    if (Login !== user?.username) {
      const v1 = USER_REGEX.test(Login);
      if (!v1) {
        setErrMsg("Invalid Entry");
        return;
      }
      formData.append("login", Login);
    }
    //console.log("Form = " + formData.getAll("login"));
    try {
      // const response: AxiosResponse = await axiosAuthReq(HTTP_METHOD.POST, PATCH_PATH, formData, {} as AxiosHeaders, setErrMsg, set)
      console.log('formData == ' + JSON.stringify(formData.get('file')));
      const response: AxiosResponse = await axiosPrivate.post(
        PATCH_PATH,
        formData,
        {headers: {"Content-Type": "multipart/form-data"}}
      );
      console.log(response.data);
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }
      //errRef.current.focus();
    }
  };

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
      setSelectedFile(event.target.files[0]);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    setErrMsg("");
  }, []);

  /*{boolQrcode ? (
        <>
          <img src={TfaQrcode}/>
          <form onSubmit={handleCodeSubmit}>
            <label htmlFor="avatar">2FA:</label>
            <input type='text' placeholder='Enter the 6 figures code' onChange={onCodeChange}/>
            <button disabled={!validCode ? true : false}>Activate 2FA</button>
          </form>
          <p>{verified ? "true" : "false"}</p>
        </>
        ):(
        <>
        </>
        )
        }*/

  useEffect(() => {
    const result = USER_REGEX.test(Login);
    setValidLogin(result);
  }, [Login]);

  useEffect(() => {
    setValidUser(false);
    const getProfile = async () => {
      const profile = await axiosAuthReq(HTTP_METHOD.GET, GETME_PATH, {} as AxiosHeaders, {}, setErrMsg, setUser);
      if(profile !== undefined)
      {
        setValidUser(true);
        if (validURL(profile.profilePicture))
          setPicture(profile.profilePicture);
        else
          setPicture(
            GET_PROFILE_PICTURE + profile.profilePicture.split("/")[2]
          );
        if (picture === null) setPicture(DEFAULT_IMG);
        setLogin(profile.username);
        setIsTFA(profile.isTFA);
      }
    };
    getProfile();
  }, []);

  const display2faModel = (content: string, path: string) => {
    setModelContent(content);
    setPathConfirm(path);
    setModelDisplay(true);
  };

  const redirectClick = (e : React.MouseEvent<HTMLElement>) => {
    if (myRef.current)
      myRef.current.click();
  }
  console.log(isTFA);
  return (
    <>
      <Sidebar />
      <Headers />
      <Popup
        apparent={modelDisplay}
        title={popupTitle}
        content={modelContent}
        handleTrue={(e: any) => navigate(pathConfirm)}
        handleFalse={(e: any) => setModelDisplay(false)}
      />
      <h1>{errMsg}</h1>
      {validUser ? (
        <main className="grid-container-User">
          <section className="section-modif-User">
            <div className="profilePicture-User">
            <img
              src={image ? image : picture}
              className="picture-User"
              alt="profile_picture"
            />
                <button className="show button-changePicture reverse-btn btn-file" onClick={redirectClick}>
                <SvgIcon component={UploadFileIcon}/>
</button>
</div>
            <form className="form-User display-flex-column" onSubmit={handleSubmit}>
              <label className="hiden" htmlFor="avatar">
                <p className="display-none">Choose a profile picture:</p>
                <input
                  type="file"
                  onChange={onImageChange}
                  className="display-none"
                  id="avatar"
                  name="avatar"
                  ref={myRef}
                  accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                />
              </label>
              <input
                type={"text"}
                className="name-field-User"
                id="username"
                value={Login}
                autoComplete="off"
                onChange={(e) => setLogin(e.target.value)}
                required
              />
              <button className={validLogin? "save-btn-User btn-transparent fit-content save-btn-valid-User" : "save-btn-User btn-transparent fit-content save-btn-unvalid-User "} disabled={!validLogin ? true : false}>Save</button>
            </form>
          </section>
          <section className="section-settings-User">
            <h1 className="settings-User">SETTINGS</h1>
            <div className="tfa-User">
            <label>Activate Google Authentificator 2FA</label>
            {/* <input type={'checkbox'} checked={isTFA} onChange={printQrCode}/> */}
            <Switch
              checked={isTFA}
              onChange={
                isTFA
                  ? (e: any) =>
                      display2faModel(popupDeleteContent, "/2fadelete")
                  : (e: any) => navigate("/2factivate")
              }
            />
            {isTFA && (
              <button
                onClick={(e: any) =>
                  display2faModel(popupChangeContent, "/2fachange")
                }
              >
                Change
              </button>
            )}
          </div>
          <button className="del-acc-User fit-content">Delete Account</button>
          </section>
        </main>
      ) : (
        <main></main>
      )}
    </>
  );
};

export default User;
