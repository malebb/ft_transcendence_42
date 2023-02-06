import axios, { AxiosResponse } from 'axios'
import React, { useEffect } from 'react'
import { axiosMain } from 'src/api/axios'
import { useSearchParams } from 'react-router-dom'
import useQuery from './useQuery'
import { Link } from 'react-router-dom'


const CALLBACK_PATH = '/auth/signin/42login/callback'


const Callback = () => {
        const query = useQuery();
    //useEffect(() => {
        const code = query.get("code") || "";
        console.log("code = " + code);
        const callback42 = async () => {
            const response : AxiosResponse = await axiosMain.post(CALLBACK_PATH, {code: code});
            console.log("response = " + JSON.stringify(response.data));
            sessionStorage.setItem("tokens", JSON.stringify(response.data));
        }
        callback42();
    //},[])
  return (
  <>
    <div>Callback</div>
    <Link to='/'>Go to Home</Link>
    </>
  )
}

export default Callback