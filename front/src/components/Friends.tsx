import React, { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import axios from 'axios'
import {getToken, axiosMain, axiosToken} from '../api/axios'
import { Link } from 'react-router-dom'
import { acceptRequest, deleteRequest, refuseRequest } from 'src/api/friend'
import Popup from 'reactjs-popup'
import Sidebar from './Sidebar'
import Headers from './Headers'
import '../styles/Friend.css'
import { GET_PROFILE_PICTURE, validURL } from 'src/api/utils'

const FRIEND_LIST_PATH = '/users/friend-list'
const RECV_LIST_PATH = '/users/recv-request'
const SEND_LIST_PATH = '/users/created-request'

type FriendType = {
  id: number
  createdAt: Date
  id42: string | null
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  profilePicture: string
  skin: string
  map: string
}

type NeutralUser = {
  id: number
  createdAt: Date
  id42: string | null
  username: string
  profilePicture: string | undefined
}

const Friends = () => {
  const [friendArray, setFriendArray] = useState<FriendType[]>();
  const [recvArray, setRecvArray] = useState<NeutralUser[]>();
  const [sendArray, setSendArray] = useState<NeutralUser[]>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleUnfriendClick = (): void => setShowConfirmation(true);

  const getRecvArray = async () => {
    const response: AxiosResponse = await (await axiosToken()).get(RECV_LIST_PATH)
    setRecvArray(response.data);
    console.log(JSON.stringify(friendArray));
  }
  const getSendArray = async () => {
    const response: AxiosResponse = await (await axiosToken()).get(SEND_LIST_PATH)
    setSendArray(response.data);
    console.log(JSON.stringify(friendArray));
  }
  const getFriendArray = async () => {
    const response: AxiosResponse = await (await axiosToken()).get(FRIEND_LIST_PATH)
    setFriendArray(response.data);
    console.log(JSON.stringify(friendArray));
  }
  const acceptRequestWrap = (friendId: number)=>
  {
    acceptRequest(friendId);
    if (recvArray)
      setRecvArray(recvArray.filter(item => item.id !== friendId));
      getFriendArray();
  } 
  const refuseRequestWrap = (friendId: number) =>
  {
    refuseRequest(friendId);
    if (recvArray)
      setRecvArray(recvArray.filter(item => item.id !== friendId));
  }
  const deleteRequestWrap = (friendId: number, array: number, confirmed: boolean) =>
  {
    if (confirmed)
    {
      const resp = deleteRequest(friendId);
      console.log(JSON.stringify(resp));
      if (array == 0 && friendArray)
        setFriendArray(friendArray.filter(item => item.id !== friendId));
      else if (array == 1 && sendArray)
        setSendArray(sendArray.filter(item => item.id !== friendId));
    }
    setShowConfirmation(false);
  }

  const handleSrc = (friend: FriendType) =>
  {
    if (validURL(friend.profilePicture))
      return friend.profilePicture;
    else
      return (GET_PROFILE_PICTURE + friend.profilePicture.split('/')[2]);
  }
  
  useEffect(() => {
  }, [friendArray, recvArray, sendArray]);

  useEffect(() => {
    getFriendArray();
    getRecvArray();
    getSendArray();
  }, []);
  return (
    <>
    <Headers/>
    <Sidebar/>
    <main>
    <div className="accordion">
     <input type="radio" name="select" className="accordion-select" checked />
    <div className="accordion-title"><span>Friend</span></div>
    <div className="accordion-content">
    <ul>
      {friendArray?.map((friend: FriendType) =>{
        return <div key={friend.id}><Link to={'/user/' + friend.id}>{<img id="profilePicture" className='profilePicture' src={handleSrc(friend)}/>}{friend.username}</Link>
        <button onClick={handleUnfriendClick}>Unfriend</button>
        {showConfirmation && (
        <div>
          <p>
          Are you sure you want to remove this person from your friends list?
            This action is final and you will not be able to recover it.
          </p>
          <button onClick={(e:any) => deleteRequestWrap(friend.id, 0, true)}>Unfriend</button>
          <button onClick={(e:any) => deleteRequestWrap(friend.id, 0, false)}>Cancel</button>
        </div>
        )}
        </div>
      })}
    </ul>
      </div> 
         <input type="radio" name="select" className="accordion-select" />
    <div className="accordion-title"><span>Sended Request</span></div>
    <div className="accordion-content">
    <ul>
      {sendArray?.map((friend: NeutralUser) =>{
        return <div key={friend.id}><Link to={'/user/' + friend.id}>{friend.username}</Link>
        <button onClick={handleUnfriendClick}>Cancel</button>
        {showConfirmation && (
        <div>
          <p>
          Are you sure you want to remove this person from your waiting list?
            This action is final and you will not be able to recover it.
          </p>
          <button onClick={(e:any) => deleteRequestWrap(friend.id, 1, true)}>Yes</button>
          <button onClick={(e:any) => deleteRequestWrap(friend.id, 1, false)}>No</button>
        </div>
        )}
        </div>
      })}
    </ul>
      </div> 
         <input type="radio" name="select" className="accordion-select" />
    <div className="accordion-title"><span>Received Request</span></div>
    <div className="accordion-content">
    <ul>
      {recvArray?.map((friend: NeutralUser) =>{
        return <div key={friend.id}><Link to={'/user/' + friend.id}>{friend.username}</Link><button onClick={(e:any) => acceptRequestWrap(friend.id)}>Accept</button><button onClick={(e:any) => refuseRequestWrap(friend.id)}>Decline</button></div>;
        //return <li key={friend.id}>{friend.username}</li>;
      })}
    </ul></div> 
</div> 
    </main>
    </>
  )
}

export default Friends