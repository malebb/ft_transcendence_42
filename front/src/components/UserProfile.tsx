import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AxiosResponse } from 'axios'
import axios from 'axios'
import {getToken, axiosMain, axiosToken} from '../api/axios'

const GET_PROFILE_PICTURE='http://localhost:3333/users/profile-image/' 
const GET_STATUS_PATH='/users/request-status/' 
const ADD_FRIEND_PATH='/users/send-friend-request/'
const CHECK_SENDER_PATH='/users/check-sender/'

type NeutralUser = {
  id: number
  createdAt: Date
  id42: string | null
  username: string
  profilePicture: string | undefined
}

  function validURL(str: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

const UserProfile = () => {
    const {userId} = useParams();
    const [user, setUser] = useState<NeutralUser>()
    const [token, setToken] = useState('')
    const [picture, setPicture] = useState('')
    const [errMsg, setErrMsg] = useState('');
    const [friendStatus, setFriendStatus] = useState<string>("");
    const [sendingStatus, setSendingStatus] = useState<string>("");

    const AddFriendReq = async () : Promise<string> => {
       // e.preventDefault();
        /*const response: AxiosResponse = await axiosMain.get(ADD_FRIEND_PATH + userId, {
            headers:{
                'Authorization': 'Bearer ' +  token
            }
        })*/
        try{
            const response: AxiosResponse = await (await axiosToken()).get(ADD_FRIEND_PATH + userId);
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
            return ("" as string);
        }

    }

    const AddFriend = async (e: any) => {
        const newstatus = await AddFriendReq();
        setFriendStatus(newstatus);
    }

    const getUserProfile = async () => {
        try{
        const token = getToken();
        const response: AxiosResponse = await axiosMain.get('users/profile/' + userId,{
          headers: {
            'Authorization': 'Bearer ' + token['access_token']
          }
        })
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
            return ({} as NeutralUser);
        }
  }

  const checkIsFriend = async (id: number) => {
    try{
    const token = getToken();
    const response : AxiosResponse = await axiosMain.get(GET_STATUS_PATH + id.toString(), {
        headers: {
            'Authorization': 'Bearer ' + token['access_token']
        }
    })
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
        return ("" as string);
    }
  }

  useEffect(() => {
    const treatData = async() =>{
        const profile = await getUserProfile();
        //if (profile.profilePicture !== undefined)
            if (validURL(profile.profilePicture))
                setPicture(profile.profilePicture);
            else
                setPicture(GET_PROFILE_PICTURE + profile.profilePicture.split('/')[2]);
            console.log(picture);
        setUser(profile);
        setFriendStatus(await checkIsFriend(profile.id));
    }
    setToken(getToken().access_token);
    treatData();
  }, []);


  const deleteRequest = async () => {
    try{
        const sendingReq: AxiosResponse = await (await axiosToken()).get('users/destroy-friend-request-by-userid/' + userId)
        console.log(JSON.stringify(sendingReq.data));
        setFriendStatus("");
        return sendingReq.data;
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
        return ("" as string);
    }
  }
  const refuseRequest = async () => {
    try{
        const sendingReq: AxiosResponse = await (await axiosToken()).get('users/decline-friend-request-by-userid/' + userId)
        console.log(JSON.stringify(sendingReq.data));
        setFriendStatus("declined");
        return sendingReq.data;
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
        return ("" as string);
    }
  }
  const acceptRequest = async () => {
    try{
        const sendingReq: AxiosResponse = await (await axiosToken()).get('users/accept-friend-request-by-userid/' + userId)
        console.log(JSON.stringify(sendingReq.data));
        setFriendStatus("accepted");
        return sendingReq.data;
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
        return ("" as string);
    }
  }
  const getReqSendingStatus = async (): Promise<string> => {
    try{
        const sendingReq: AxiosResponse = await (await axiosToken()).get(CHECK_SENDER_PATH + userId)
        return sendingReq.data;
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
        return ("" as string);
    }
  }
  const getSendingStatus = async () => {
    const senderStatus = await getReqSendingStatus();
    setSendingStatus(senderStatus);
  }

  useEffect(() => {
    if (friendStatus === "pending")
    {
        getSendingStatus();
    }
    else if (friendStatus === "declined")
    {
        getSendingStatus();
    }
    else
        setSendingStatus("");
  }, [friendStatus]);

  return (
    <div>
        {errMsg}
        UserProfile
        <img src={picture} alt='profile_picture'/>
        {user?.username}
        {sendingStatus}
        {friendStatus === "accepted" && <button onClick={deleteRequest}>Unfriend</button>}
        {friendStatus === "declined" && sendingStatus == "receiver" && <button onClick={acceptRequest}>Add friend +</button>}
        {friendStatus === "declined" && sendingStatus == "creator" && <button disabled>Not Accepted yet</button>}
        {friendStatus === "pending" && sendingStatus === "receiver" && <div><button onClick={acceptRequest}>Accept req</button><button onClick={refuseRequest}>Reject Req</button></div>}
        {friendStatus === "pending" && sendingStatus === "creator" && <button disabled>Pending</button>}
        {friendStatus === "" && <button onClick={AddFriend}>Add friend +</button>}
    </div>
  )
}

export default UserProfile