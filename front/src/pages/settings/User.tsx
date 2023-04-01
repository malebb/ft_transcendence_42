import React  from "react";
import { axiosAuthReq, HTTP_METHOD } from "../../api/axios";
import { AxiosHeaders } from "axios";
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
import useAxiosPrivate from "src/hooks/usePrivate";


//var qrcode = require('qrcode');
window.Buffer = window.Buffer || require("buffer").Buffer;

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_@.]{3,23}$/;
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

const User = () => {
  const axiosPrivate = useAxiosPrivate();
  const [user, setUser] = useState<UserType>();
  const [validUser, setValidUser] = useState<boolean>(false);
  const [picture, setPicture] = useState("");

  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTFA, setIsTFA] = useState<boolean>(false);

  const [modelDisplay, setModelDisplay] = useState<boolean>(false);
  const [modelContent, setModelContent] = useState<string>("");
  const [pathConfirm, setPathConfirm] = useState<string>("");

  const [Login, setLogin] = useState("");
  const [validLogin, setValidLogin] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState("");

  const myRef = useRef<HTMLInputElement>(null);

  const popupTitle = "WARNING";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    if (selectedFile !== null && selectedFile !== undefined)

      formData.append("file", selectedFile);
    if (Login !== user?.username) {
      const v1 = USER_REGEX.test(Login);
      if (!v1) {
        setErrMsg("Invalid Entry");
        return;
      }
      formData.append("login", Login);
    }
    try {
      await axiosPrivate.post(
        PATCH_PATH,
        formData,
        {headers: {"Content-Type": "multipart/form-data"}}
      );
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }
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
  }, [picture]);

  const display2faModel = (content: string, path: string) => {
    setModelContent(content);
    setPathConfirm(path);
    setModelDisplay(true);
  };

  const redirectClick = () => {
    if (myRef.current)
      myRef.current.click();
  }
  return (
    <>
      <Sidebar />
      <Headers />
      <Popup
        apparent={modelDisplay}
        title={popupTitle}
        content={modelContent}
        handleTrue={() => navigate(pathConfirm)}
        handleFalse={() => setModelDisplay(false)}
      />
      {validUser ? (
        <main className="grid-container-User">
          <p className="errMsg">{errMsg}</p>
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
            <div className="tfa-User">
            <label>Activate Google Authentificator 2FA</label>
            {/* <input type={'checkbox'} checked={isTFA} onChange={printQrCode}/> */}
            <Switch
              checked={isTFA}
              onChange={
                isTFA
                  ? () =>
                      display2faModel(popupDeleteContent, "/2fadelete")
                  : () => navigate("/2factivate")
              }
            />
          </div>
          </section>
        </main>
      ) : (
        <main></main>
      )}
    </>
  );
};

export default User;
