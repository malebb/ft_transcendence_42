import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { AxiosResponse, AxiosInstance } from 'axios'
import axios from 'axios'
import {getToken, axiosMain, axiosToken} from '../api/axios'
import '../styles/UserProfile.css';
import Sidebar from './Sidebar';
import Headers from './Headers';
import Stats from './Stats';
import Achievements from './Achievements';
import { FriendType }  from './Friends';

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
    const [showConfirmation, setShowConfirmation] = useState(false);
	  const userSessionId = JSON.parse(sessionStorage.getItem('id')!);
	const axiosInstance = useRef<AxiosInstance | null>(null);
	const [isFriend, setIsFriend] = useState<boolean>(false);

    const handleUnfriendClick = (): void => setShowConfirmation(true);

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


  const deleteRequest = async (confirmed: boolean) => {
    if (confirmed) 
    {
      try{
          const sendingReq: AxiosResponse = await (await axiosToken()).get('users/destroy-friend-request-by-userid/' + userId)
          console.log(JSON.stringify(sendingReq.data));
          setFriendStatus("");
          setShowConfirmation(false);
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
          setShowConfirmation(false);
          return ("" as string);
      }
    }
    setShowConfirmation(false);
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
      if (showConfirmation)
      {
        //document.body.style.opacity="0.5";
        
        document.body.style.background="#1f2125";
        document.getElementById("profilePicture")!.style.opacity = "0.5";
        document.getElementById("divprofileName")!.style.opacity = "0.5";
        document.body.style.zIndex="98";
      }
      else
      {
       // document.body.style.opacity="1";
        document.body.style.background="";
        document.getElementById("profilePicture")!.style.opacity = "1";
        document.getElementById("divprofileName")!.style.opacity = "1";
        document.body.style.zIndex="";
      }
  }, [showConfirmation]);

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

	function printAchievements()
	{
		return (isFriend ? <Achievements/> : (<p id="notFriend">Only friends can see achievements</p>));
	}

	useEffect(() =>
	{
		const checkIfFriend = async () =>
		{
			let friendList: FriendType[] = [];
			let profileUser: NeutralUser;
			let myProfile: NeutralUser;

			axiosInstance.current = await axiosToken();
			friendList = (await axiosInstance.current.get('/users/friend-list')).data;
			profileUser = (await axiosInstance.current.get('/users/profile/' + userId)).data;
			myProfile = (await axiosInstance.current.get('/users/me')).data;
			if (profileUser.username === myProfile.username)
				setIsFriend(true);
			friendList.forEach((friend) => 
			{
				if (friend.username === profileUser.username)
					setIsFriend(true);
			});
		}
		checkIfFriend();
	}, []);

  return (
    <>
        <Headers/>
        <Sidebar/>
	<div id="userProfile">
        {errMsg}

	<br/>
        <div className={showConfirmation? 'container' : 'container'}>
          {/* <div className='divprofilePicture'> */}
            <img id="profilePicture" className="profilePicture" src={picture} alt='profile_picture'/>
          {/* </div> */}
        <div id="divprofileName" className='divprofileName'>
          <p className='profileName'>{(user?.username)?.slice(0,15)}</p>
        </div>
        <div className='profileFriendButton'>
        {friendStatus === "accepted" && <div> 
        <button id="profileButtonCancel" className='profileButtonCancel' onClick={handleUnfriendClick}>Unfriend</button>
        {showConfirmation && (
        <div className='profileConfirmPopup'>
          <p className='popupText'>
          Are you sure you want to remove this person from your friends list?
            This action is final and you will not be able to recover it.
          </p>
          <button className='profileConfirmYes'onClick={(e:any) => deleteRequest(true)}>Unfriend</button>
          <button className='profileConfirmNo'onClick={(e:any) => deleteRequest(false)}>Cancel</button>
        </div>
        )}
        </div>
        }
        {/* //  <button onClick={deleteRequest}>Unfriend</button>} */}
        {friendStatus === "declined" && sendingStatus == "receiver" && <button className='profileButtonAddFriend' onClick={acceptRequest}>Add friend +</button>}
        {/* {friendStatus === "declined" && sendingStatus == "creator" && <button className='profileButtonWaiting' disabled>Not Accepted yet</button>} */}
        {friendStatus === "pending" && sendingStatus === "receiver" && <div><button className='profileButtonAddFriend' onClick={acceptRequest}>Accept req</button><button className='profileButtonRefuse' onClick={refuseRequest}>Reject Req</button></div>}
        {friendStatus === "pending" && sendingStatus === "creator" && <div> 
        <button id="profileButtonCancel" className={showConfirmation ? 'profileButtonCancel' : 'profileButtonCancel'} onClick={handleUnfriendClick}>Cancel</button>
        {showConfirmation && (
        <div className='profileConfirmPopup'>
          <p className='popupText'>
          Are you sure you want to remove this person from your waiting list?
            This action is final and you will not be able to recover it.
          </p>
          <button className='profileConfirmYes' onClick={(e:any) => deleteRequest(true)}>Yes</button>
          <button className='profileConfirmNo' onClick={(e:any) => deleteRequest(false)}>No</button>
        </div>
        )}
        </div>
        }
        {/* <button disabled>Pending</button>} */}
        {(friendStatus === "" && (userId != userSessionId)) ?
          <button className='profileButtonAddFriend' onClick={AddFriend}>Add friend +</button> : (<></>)
          }
        </div>

    </div>
	<Stats/>
	<br/>
	<br/>
	{printAchievements()}
	</div>
    </>
  )
}

export default UserProfile
