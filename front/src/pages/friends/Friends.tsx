import React, { useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import axios from "axios";
import { getToken, axiosMain, axiosToken } from "../../api/axios";
import { Link } from "react-router-dom";
import { acceptRequest, deleteRequest, refuseRequest } from "src/api/friend";
import Popup from "src/components/Popup";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Headers";
import "../../styles/Friends.css";
import { GET_PROFILE_PICTURE, validURL } from "src/api/utils";
import AuthContext from "src/context/TokenContext";

const FRIEND_LIST_PATH = "/users/friend-list";
const RECV_LIST_PATH = "/users/recv-request";
const SEND_LIST_PATH = "/users/created-request";

export type FriendType = {
  id: number;
  createdAt: Date;
  id42: string | null;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string;
  skin: string;
  map: string;
};

type NeutralUser = {
  id: number;
  createdAt: Date;
  id42: string | null;
  username: string;
  profilePicture: string;
};

enum StatusEnum {
  FRIEND= 1,
  RECV,
  SEND,
}

const Friends = () => {
  const {token, setToken} = useContext(AuthContext);
  const [renderType, setRenderType] = useState<number>(StatusEnum.FRIEND);
  const [friendArray, setFriendArray] = useState<FriendType[]>();
  const [recvArray, setRecvArray] = useState<NeutralUser[]>();
  const [sendArray, setSendArray] = useState<NeutralUser[]>();
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<string>("");
  const [list, setList] = useState<number>(0);

  const popupTitle = "WARNING";
  const popupContentRemoveFriend =
    "Are you sure you want to remove this person from your friends list? This action is final and you will not be able to recover it.";
  const popupContentRemoveWait =
    "Are you sure you want to remove this person from your waiting list? This action is final and you will not be able to recover it.";


  const handleUnfriendClick = (): void => 
  {
    setShowConfirmation(true);
    setPopupContent(popupContentRemoveFriend);
    setList(0);
  }
  const handleUnWaitClick = (): void => {
    setShowConfirmation(true);
    setPopupContent(popupContentRemoveWait);
    setList(1);
  };

  const getRecvArray = async () => {
    const response: AxiosResponse = await (
      await axiosToken(token!, setToken)
    ).get(RECV_LIST_PATH);
    setRecvArray(response.data);
    console.log(JSON.stringify(friendArray));
  };
  const getSendArray = async () => {
    const response: AxiosResponse = await (
      await axiosToken(token!, setToken)
    ).get(SEND_LIST_PATH);
    setSendArray(response.data);
    console.log(JSON.stringify(friendArray));
  };
  const getFriendArray = async () => {
    const response: AxiosResponse = await (
      await axiosToken(token!, setToken)
    ).get(FRIEND_LIST_PATH);
    setFriendArray(response.data);
    console.log(JSON.stringify(friendArray));
  };

  useEffect(() => {
  if (renderType === StatusEnum.FRIEND)
    getFriendArray();
  if (renderType === StatusEnum.SEND)
    getSendArray();
  if (renderType === StatusEnum.RECV)
    getRecvArray();
  }, [renderType]);

  const acceptRequestWrap = (friendId: number) => {
    acceptRequest(friendId, token!, setToken);
    if (recvArray)
      setRecvArray(recvArray.filter((item) => item.id !== friendId));
    getFriendArray();
  };
  const refuseRequestWrap = (friendId: number) => {
    refuseRequest(friendId, token!, setToken);
    if (recvArray)
      setRecvArray(recvArray.filter((item) => item.id !== friendId));
  };
  const deleteRequestWrap = (
    friendId: number,
    array: number,
    confirmed: boolean
  ) => {
    if (confirmed) {
      const resp = deleteRequest(friendId, token!, setToken);
      console.log(JSON.stringify(resp));
      if (array == 0 && friendArray)
        setFriendArray(friendArray.filter((item) => item.id !== friendId));
      else if (array == 1 && sendArray)
        setSendArray(sendArray.filter((item) => item.id !== friendId));
    }
    setShowConfirmation(false);
  };

  const handleSrcFriend = (friend: FriendType) => {
    if (validURL(friend.profilePicture)) return friend.profilePicture;
    else return GET_PROFILE_PICTURE + friend.profilePicture.split("/")[2];
  };
  const handleSrcNeutral = (neutral: NeutralUser) => {
    if (validURL(neutral.profilePicture)) return neutral.profilePicture;
    else return GET_PROFILE_PICTURE + neutral.profilePicture.split("/")[2];
  };

  const handleSwitch = (e : any) =>
  {
    const otherSwitch = document.getElementsByClassName("switch-label_selected");
    if (!otherSwitch)
      return;
    if (otherSwitch.length > 0)
      for(var i = 0; i < otherSwitch.length ; i++)
          otherSwitch.item(i)!.className = "switch-label_item";
    e.target.classList.replace("switch-label_item","switch-label_selected");
    console.log(parseInt(e.target.id.split('_')[1]));
    setRenderType(parseInt(e.target.id.split('_')[1]));
  }

  useEffect(() => {}, [friendArray, recvArray, sendArray]);

  useEffect(() => {
    getFriendArray();
    getRecvArray();
    getSendArray();
  }, []);
  return (
    <>
      <Headers />
      <Sidebar />
      <main> 
            <div className="switch-label_container">
              <div id="switch-label_1" className={"switch-label_selected"} tabIndex={0} onClick={handleSwitch}>Friends</div>
              <div id="switch-label_2" className={"switch-label_item"} tabIndex={0} onClick={handleSwitch}>Pending</div>
              <div id="switch-label_3" className={"switch-label_item"} tabIndex={0} onClick={handleSwitch}>Send</div>
            </div>
            <ul className={renderType === StatusEnum.FRIEND ? "show": "hiden"}>
              {friendArray?.map((friend: FriendType) => {
                return (
                  <div key={friend.id}>
          <Popup
            apparent={showConfirmation}
            title={popupTitle}
            content={popupContent}
            handleTrue={(e: any) =>
                            deleteRequestWrap(friend.id, list, true)
                          }
            handleFalse={(e: any) =>
                            deleteRequestWrap(friend.id, list, false)
                          }
          />
                    <Link className="link-user" to={"/user/" + friend.id}>
                      {
                        <img
                        alt="profile_picture"
                          id="profilePicture"
                          className="profilePicture"
                          src={handleSrcFriend(friend)}
                        />
                      }
                      {friend.username}
                    </Link>
                    <button className="profileButtonCancel" onClick={handleUnfriendClick}>Unfriend</button>
                    {/* {showConfirmation && (
                      <div>
                        <p>
                          Are you sure you want to remove this person from your
                          friends list? This action is final and you will not be
                          able to recover it.
                        </p>
                        <button
                          onClick={(e: any) =>
                            deleteRequestWrap(friend.id, 0, true)
                          }
                        >
                          Unfriend
                        </button>
                        <button
                          onClick={(e: any) =>
                            deleteRequestWrap(friend.id, 0, false)
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    )} */}
                  </div>
                );
              })}
            </ul>
            <ul className={renderType === StatusEnum.SEND ? "show": "hiden"}>
              {sendArray?.map((friend: NeutralUser) => {
                return (
                  <div key={friend.id}>
                    <Link className="link-user" to={"/user/" + friend.id}>
                        {
                          <img
                          alt="profile_picture"
                          id="profilePicture"
                          className="profilePicture"
                          src={handleSrcNeutral(friend)}
                        />
                        }
                      {friend.username}
                      </Link>
                    <button className="profileButtonCancel" onClick={handleUnfriendClick}>Cancel</button>
                    {/* {showConfirmation && (
                      <div>
                        <p>
                          Are you sure you want to remove this person from your
                          waiting list? This action is final and you will not be
                          able to recover it.
                        </p>
                        <button
                          onClick={(e: any) =>
                            deleteRequestWrap(friend.id, 1, true)
                          }
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e: any) =>
                            deleteRequestWrap(friend.id, 1, false)
                          }
                        >
                          No
                        </button>
                      </div>
                    )} */}
                  </div>
                );
              })}
            </ul>
            <ul className={renderType === StatusEnum.RECV ? "show": "hiden"}>
              {recvArray?.map((friend: NeutralUser) => {
                return (
                  <div key={friend.id}>
                    <Link className="link-user" to={"/user/" + friend.id}>
                        {<img
                        alt="profile_picture"
                          id="profilePicture"
                          className="profilePicture"
                          src={handleSrcNeutral(friend)}
                        />}
                      {friend.username}
                      </Link>
                    <button className="profileButtonAddFriend" onClick={(e: any) => acceptRequestWrap(friend.id)}>
                      Accept
                    </button>
                    <button className="profileButtonRefuse" onClick={(e: any) => refuseRequestWrap(friend.id)}>
                      Decline
                    </button>
                  </div>
                );
                //return <li key={friend.id}>{friend.username}</li>;
              })}
            </ul>
      </main>
    </>
  );
};

export default Friends;
