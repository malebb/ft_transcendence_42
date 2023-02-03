import React from 'react'
import { axiosMain, axiosToken } from '../api/axios'
import axios, { AxiosResponse } from 'axios';
import userEvent from '@testing-library/user-event';
import { SemanticClassificationFormat, setSourceMapRange } from 'typescript';
import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
//var speakeasy = require('speakeasy');
import speakeasy from 'speakeasy';
//var qrcode = require('qrcode');
import qrcode from 'qrcode';
import { createSecretKey } from 'crypto';
import { useNavigate, Link} from 'react-router-dom';
//var qrcode = require('qrcode');
window.Buffer = window.Buffer || require("buffer").Buffer; 

const USER_PATH = 'users';
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_@.]{3,23}$/;
const CODE_REGEX = /^[0-9]{6}$/;
const PATCH_PATH = '/users/patchme'
const DEFAULT_IMG='default_profile_picture.png'


  const secret = speakeasy.generateSecret({
      name: "transcendence",
    })

type UserType = {
  email: string,
  profilePicture: string,
  id: number,
  isTFA: boolean,
}

/*const secret = speakhexgenerateSecret({
  name: "broMagicBasketIsSuchAMovie"
})

if (secret.otpauth_url !== undefined)
  var qrcode_img = qrcode.toDataURL(secret.otpauth_url, function(err: any, data: any){
  if (err) return err;
})
console.log(qrcode_img);*/
const getPic = async(jwt: string) => {
  try{
    console.log("jwt = " + jwt);
  const response: AxiosResponse = await axios.get('http://localhost:3333/users/profile-image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.pnge5ac4441-06e8-4956-9e34-0941006e7bf8.png',{
    headers: {
      'Authorization': 'Bearer ' + jwt
    }
  });
  console.log("getPic = " + response.data);
  return response.data;
  }
  catch(err:any){
    console.log('error getPic');
    return null;
  }
}

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
  const [refresh, setRefresh] = useState('');
  const [user, setUser] = useState<UserType>();
  const [validUser, setValidUser] = useState<boolean>(false);
  const [picture, setPicture] = useState('');
  
  const [image, setImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [TfaQrcode, setTfaQrcode] = useState('');
  const [isTFA, setIsTFA] = useState<boolean>(false);
  const [boolQrcode, setboolQrcode] = useState<boolean>(false);

  const [code, setCode] = useState('');
  const [validCode, setValidCode] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  const [Login, setLogin] = useState('');
  const [validLogin, setValidLogin] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState('');
  console.log("LOOOOOOP");


  useEffect(() => {
    const result = CODE_REGEX.test(code);
    console.log(result);
    console.log(code);
    setValidCode(result);
  }, [code])

  const getJWT = () => {
    const jwt = JSON.parse(sessionStorage.getItem("tokens") || '{}');
    return jwt['access_token'];
  }

  const printQrCode = async (e: React.FormEvent) => {
    //e.preventDefault();

    console.log("secret otpauth url ====  " + JSON.stringify(secret));
   // let qr
    try{
    if (secret.otpauth_url !== undefined)
        setTfaQrcode(((await axiosMain.get('/auth/create2FA',  
      {
        headers: {'Authorization': 'Bearer ' + getJWT()},
        //withCredentials: true
      }
        )).data
          //qrcode.toDataURL(secret.otpauth_url,{type: "image/jpeg"}/*, function(err: any, data: any){
          /*console.log(err);
    }*/));
    //console.log("qr ====" + qr); 
    }
    catch(err: any)
    {
      console.error(err);
    }
    boolQrcode ? setboolQrcode(false) : setboolQrcode(true);
    console.log("QRCODE =======" + TfaQrcode);
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verif = (await axiosMain.post('/auth/verify2FA', {code: code},
      {
        headers: {'Authorization': 'Bearer ' + getJWT()},
        //withCredentials: true
      }
    )).data;
    /*speakeasy.totp.verify({
      secret: secret.hex,
      encoding: 'hex',
      token: code,
    }) */
    console.log("verif code =======" + verif);
      //setVerified(verif);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (selectedFile !== null)
    {
      console.log("good file");
      formData.append("file", selectedFile);
    }
    if (Login !== user?.email)
    {
      const v1 = USER_REGEX.test(Login);
      if (!v1 )
      {
        setErrMsg("Invalid Entry");
        return;
      }
      formData.append("login", Login);
    }
    //console.log("Form = " + formData.getAll("login"));
    try{
      const response: AxiosResponse = await axiosMain.patch(PATCH_PATH, formData,
      {
        headers: {'Authorization': 'Bearer ' + getJWT()},
        //withCredentials: true
      });
      console.log(response.data);
      //`setSuccess(true);
     // setToken(response.data.token);
      //sessionStorage.setItem("tokens", JSON.stringify(response.data));
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

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
      setSelectedFile(event.target.files[0]);
    }
   }
   
  const onCodeChange = (event: any) => {
      setCode(event.target.value); 
    }
  
  const getMe = async(jwt: string) : Promise<UserType> => {
    try{
    console.log("jwt = " + jwt);
    const response: AxiosResponse = await axios.get('http://localhost:3333/users/me',{
      headers: {
        'Authorization': 'Bearer ' + jwt
      }
    });
    console.log("getMe = " + JSON.stringify(response.data));
    return response.data;
    }
    catch(err:any){
      console.log('error getme');
      if (!err?.response)
      {
        setErrMsg('No Server Response');
      }else if (err.response?.status === 403)
      {
        setErrMsg('Invalid Credentials');
      }else{
        setErrMsg('Unauthorized');
      }
    return ({} as UserType);
    }
  }

const navigate = useNavigate();
const QrCodePage = () =>
{
  navigate('/', {replace: true});
}

useEffect(() => {
  setErrMsg('');
}, [])


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
  console.log(result);
  console.log(Login);
  setValidLogin(result);
}, [Login])

  useEffect(() =>
  {
    setValidUser(false);
    const getToken = async () => {  
    const jwt = JSON.parse(sessionStorage.getItem("tokens") || '{}');
    console.log("propos");
    //if (jwt) {
      const profile = await getMe(jwt['access_token']);
      if (errMsg === '' && profile.id !== undefined)
      {
        setUser(profile);
        console.log("id = " + profile.id)
        setValidUser(true);
        console.log("profilePicture = " + JSON.stringify(profile.profilePicture));
        console.log("split = " + JSON.stringify(user?.profilePicture.split('/')[2]));
        setPicture(profile.profilePicture.split('/')[2]);
        if (picture === null)
          setPicture(DEFAULT_IMG);
        setLogin(profile.email);
        setIsTFA(profile.isTFA);
        console.log("profile = " + JSON.stringify(profile));
      }
    //}
  }
  getToken();
  }, []);
  console.log("user = " + JSON.stringify(user));
  console.log("pciture = " + JSON.stringify(picture));
  console.log("bool =" + validUser);
 // const jwt = JSON.parse(sessionStorage.getItem("tokens") || '{}');
  //console.log(jwt['access_token']);
          //aria-invalid={validLogin ? "false" : "true"}
          //aria-describedby="uidnote"
  console.log("image to print = " + image);
  console.log("errMsg = " + errMsg);
    return (
      <div>
      {validUser ?(<><section>
        <img src={image ? image : "http://localhost:3333/users/profile-image/" + picture} alt='profile_picture'/>
        <form onSubmit={handleSubmit}>
        <label htmlFor="avatar">Choose a profile picture:</label>
        <input type="file"
          onChange={onImageChange}
          className="user_file_input" 
          id="avatar" name="avatar"
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"></input>
        <input type={'text'}
          id='username'
          value={Login}
          autoComplete='off'
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <button disabled={!validLogin ? true : false}>Save</button>
        </form>
      </section>
      <section>
        <h1>SETTINGS</h1>
        <label>Activate Google Authentificator 2FA</label>
        <input type={'checkbox'} checked={isTFA} onChange={printQrCode}/>
        {isTFA ? (<>
        <Link className="Nav-Qrcode" to="/2famodif">
        <button /*onClick={QrCodePage}*/>Change</button>
        </Link>
        <Link className="Nav-Qrcode" to="/2fadelete">
        <button /*onClick={QrCodePage}*/>Delete</button>
        </Link>
        </>
        ):(
        <Link className="Nav-Qrcode" to="/2factivate">
        <button /*onClick={QrCodePage}*/>Activate</button>
        </Link>)}
      </section>
      </>):(
        <section>

        </section>
      )
      }
      </div>
    )
  }


export default User;