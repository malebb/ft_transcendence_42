import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { Dispatch, SetStateAction, useContext } from "react";
import AuthContext from "src/context/TokenContext";
import { TokensInterface } from "src/interfaces/Sign";
import Cookies from 'js-cookie';

const baseURL = "http://localhost:3333";


export enum HTTP_METHOD{
  GET,
  POST,
  PATCH,
}

export const axiosMain = axios.create({
  baseURL,
  withCredentials: true
});

export const axiosPrivate = axios.create({
  baseURL,
  headers: {'Content-Type': 'application/json'},
  withCredentials: true
});

export function getToken() {
  return Cookies.get("rt_token")!;
}

export function getRefreshHeader() {
  if (!getToken()) return null;
  console.log('cookie = ' + getToken());
  return `Bearer ${getToken()}`;
}

export async function getJWTfromRt(setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>>): Promise<boolean> {
  try{
    const new_jwt: AxiosResponse = await axiosMain.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: getRefreshHeader(),
        },
      }
    );
    setToken(new_jwt.data.tokens);
    // Cookies.set('rt_token', new_jwt.data.rt_token);
    console.log('data = ' + JSON.stringify(new_jwt.data));
  }
  catch(err: any)
  {
    return false;
  }
  return true;
}

export async function axiosToken(token: TokensInterface, setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>> ) {
  const date = new Date();
  console.log(JSON.stringify(token));
  if(token === undefined)
  {
    const new_jwt: AxiosResponse = await axiosMain.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: getRefreshHeader(),
        },
      }
    );
    // localStorage.setItem("tokens", JSON.stringify(new_jwt.data));
    setToken(new_jwt.data.tokens);
    return axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${new_jwt.data.access_token}` },
  });
  }
    else {
  const time = token['expireIn'];
  const crea_time = new Date(token["crea_time"]);
  if (date.getTime() >= crea_time.getTime() + (time - 10) * 1000) {
    const new_jwt: AxiosResponse = await axiosMain.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: getRefreshHeader(),
        },
      }
    );
    // localStorage.setItem("tokens", JSON.stringify(new_jwt.data));
    setToken(new_jwt.data.tokens);
    return axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${new_jwt.data.access_token}` },
  });
  }}
    return axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${token.access_token}` },
  });
}
// export async function axiosToken() {
  // const date = new Date();
  // const token = JSON.parse(localStorage.getItem("tokens")!);
  // const time = token["expireIn"];
  // const crea_time = new Date(token["crea_time"]);
  // if (date.getTime() >= crea_time.getTime() + (time - 10) * 1000) {
    // const new_jwt: AxiosResponse = await axiosMain.post(
      // "/auth/refresh",
      // {},
      // {
        // headers: {
          // Authorization: getRefreshHeader(),
        // },
      // }
    // );
    // localStorage.setItem("tokens", JSON.stringify(new_jwt.data));
  // }
// 
  // return axios.create({
    // baseURL,
    // headers: { Authorization: getAuthorizationHeader() },
  // });
// 
// }
//TODO check AxiosInstance
  export async function axiosAuthReq<Type>(method: number, path: string, headers: AxiosHeaders, body: Object, setErrorMsg: Dispatch<SetStateAction<string>>, setData : Dispatch<SetStateAction<Type>>) : Promise<Type | undefined>{
    try{
      if (method === HTTP_METHOD.POST)
      {
        const response : AxiosResponse = await axiosPrivate.post(path, body,{headers: headers});
        setData(response.data);
        return response.data;
      }
      else if (method === HTTP_METHOD.GET)
      {
        const response : AxiosResponse = await axiosPrivate.get(path,{headers: headers});
        setData(response.data);
        return response.data;
      }
      else if (method === HTTP_METHOD.PATCH)
      {
        const response : AxiosResponse = await axiosPrivate.post(path, body,{headers: headers});
        setData(response.data);
        return response.data;
      }
    }catch(err : any)
    {
      if (err.response)
      {
        setErrorMsg(err.response.data); 
      }
      else if(err.request)
      {
        setErrorMsg(err.request);
      }
      else
      {
        setErrorMsg(err.message);
      }
    }
  }
    
    // axiosAuthReq<UserType | undefined>(HTTP_METHOD.GET,
    //     "http://localhost:3333/users/me",
    //     {} as AxiosHeaders, {},setErrMsg, setResp);

    // console.log("errMSG == " + JSON.stringify(errMsg));
    // console.log("Resp ==" + JSON.stringify(resp));

  export async function axiosReq<Type>(method: number, path: string, headers: AxiosHeaders, body: Object, setErrorMsg: Dispatch<SetStateAction<string>>, setData : Dispatch<SetStateAction<Type>>) : Promise<Type | undefined>{
    try{
      if (method === HTTP_METHOD.POST)
      {
        const response : AxiosResponse = await axios.post(path, body,{headers: headers});
        setData(response.data);
        return response.data;
      }
      else if (method === HTTP_METHOD.GET)
      {
        const response : AxiosResponse = await axios.get(path,{headers: headers});
        setData(response.data);
        return response.data;
      }
      else if (method === HTTP_METHOD.PATCH)
      {
        const response : AxiosResponse = await axios.post(path, body,{headers: headers});
        setData(response.data);
        return response.data;
      }
    }catch(err : any)
    {
      if (err.response)
      {
        setErrorMsg(err.response.data); 
      }
      else if(err.request)
      {
        setErrorMsg(err.request);
      }
      else
      {
        setErrorMsg(err.message);
      }
    }
  }
