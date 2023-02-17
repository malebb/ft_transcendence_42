import React, { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import axios from 'axios'
import {getToken, axiosMain, axiosToken} from '../api/axios'

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
  profilePicture: string | null
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

  useEffect(() => {
    getFriendArray();
    getRecvArray();
    getSendArray();
  }, []);
  return (
    <>
    <div>Friends</div>
    <ul>
      {friendArray?.map((friend: FriendType) =>{
        return <li key={friend.id}>{friend.username}</li>;
      })}
    </ul>
    <div><br></br>
    <ul>
      {sendArray?.map((friend: NeutralUser) =>{
        return <li key={friend.id}>{friend.username}</li>;
      })}
    </ul></div>
    <div><br></br>
    <ul>
      {recvArray?.map((friend: NeutralUser) =>{
        return <li key={friend.id}>{friend.username}</li>;
      })}
    </ul></div>
    </>
  )
}

export default Friends