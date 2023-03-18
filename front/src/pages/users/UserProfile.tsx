import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { AxiosResponse, AxiosInstance, AxiosHeaders } from "axios";
import axios from "axios";
import { getToken, axiosMain, axiosToken, axiosAuthReq, HTTP_METHOD } from "../../api/axios";
import "../../styles/UserProfile.css";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Headers";
import Stats from "./components/Stats";
import Achievements from "./components/Achievements";
import { FriendType } from "../friends/Friends";
import Popup from "../../components/Popup";

const GET_PROFILE_PICTURE = "http://localhost:3333/users/profile-image/";
const GET_USER_PROFILE = "users/profile/";
const GET_STATUS_PATH = "/users/request-status/";
const ADD_FRIEND_PATH = "/users/send-friend-request/";
const CHECK_SENDER_PATH = "/users/check-sender/";
//
type NeutralUser = {
  id: number;
  createdAt: Date;
  id42: string | null;
  username: string;
  profilePicture: string;
};

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

interface i_renderProfile {
  user: NeutralUser;
  picture: string;
  friendStatus: string;
  isFriend: boolean;
}

const UserProfile = () => {
  const { userId } = useParams();

  const [renderProfile, setRenderProfile] = useState<i_renderProfile>();
  const [user, setUser] = useState<NeutralUser>();
  const [picture, setPicture] = useState("");
  const [friendStatus, setFriendStatus] = useState<string>("");
  const [isFriend, setIsFriend] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState("");

  const [sendingStatus, setSendingStatus] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<string>("");

  const axiosInstance = useRef<AxiosInstance | null>(null);

  const popupTitle = "WARNING";
  const popupContentRemoveFriend =
    "Are you sure you want to remove this person from your friends list? This action is final and you will not be able to recover it.";
  const popupContentRemoveWait =
    "Are you sure you want to remove this person from your waiting list? This action is final and you will not be able to recover it.";
  const userSessionId = JSON.parse(sessionStorage.getItem("id")!);

  const handleUnfriendClick = (): void => {
    setPopupContent(popupContentRemoveFriend);
    setShowConfirmation(true);
  };
  const handleUnWaitClick = (): void => {
    setPopupContent(popupContentRemoveWait);
    setShowConfirmation(true);
  };

  const AddFriendReq = async (): Promise<string> => {
    // e.preventDefault();
    /*const response: AxiosResponse = await axiosMain.get(ADD_FRIEND_PATH + userId, {
            headers:{
                'Authorization': 'Bearer ' +  token
            }
        })*/
    try {
      const response: AxiosResponse = await (
        await axiosToken()
      ).get(ADD_FRIEND_PATH + userId);
      return response.data;
    } catch (err: any) {
      console.log("error getme");
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Unauthorized");
      }
      return "" as string;
    }
  };

  const AddFriend = async (e: any) => {
    const newstatus = await AddFriendReq();
    setFriendStatus(newstatus);
  };

  const getUserProfile = async () => {
    try {
      const token = getToken();
      const response: AxiosResponse = await axiosMain.get(
        "users/profile/" + userId,
        {
          headers: {
            Authorization: "Bearer " + token["access_token"],
          },
        }
      );
      return response.data;
    } catch (err: any) {
      console.log("error getme");
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Unauthorized");
      }
      return {} as NeutralUser;
    }
  };

  const checkIsFriend = async (id: number) => {
    try {
      const token = getToken();
      const response: AxiosResponse = await axiosMain.get(
        GET_STATUS_PATH + id.toString(),
        {
          headers: {
            Authorization: "Bearer " + token["access_token"],
          },
        }
      );
      return response.data;
    } catch (err: any) {
      console.log("error getme");
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Unauthorized");
      }
      return "" as string;
    }
  };

  useEffect(() => {
    const treatData = async () => {
      const profile = await axiosAuthReq(HTTP_METHOD.GET, GET_USER_PROFILE + userId, {} as AxiosHeaders, {}, setErrMsg, setUser);
      if (profile === undefined) return ;
      if (profile !== undefined){
        if (validURL(profile.profilePicture)) setPicture(profile.profilePicture);
        else
          setPicture(GET_PROFILE_PICTURE + profile.profilePicture.split("/")[2]);
        console.log(picture);
        await axiosAuthReq(HTTP_METHOD.GET, GET_STATUS_PATH + userId, {} as AxiosHeaders, {}, setErrMsg, setFriendStatus);
      }
    };
    treatData();
  }, [userId]);

  const deleteRequest = async (confirmed: boolean): Promise<void> => {
    if (confirmed) {
      try {
        const sendingReq: AxiosResponse = await (
          await axiosToken()
        ).get("users/destroy-friend-request-by-userid/" + userId);
        console.log(JSON.stringify(sendingReq.data));
        setFriendStatus("");
        setShowConfirmation(false);
        //return sendingReq.data;
      } catch (err: any) {
        console.log("error getme");
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 403) {
          setErrMsg("Invalid Credentials");
        } else {
          setErrMsg("Unauthorized");
        }
        setShowConfirmation(false);
        //return "" as string;
      }
    }
    setShowConfirmation(false);
  };
  const refuseRequest = async () => {
    try {
      const sendingReq: AxiosResponse = await (
        await axiosToken()
      ).get("users/decline-friend-request-by-userid/" + userId);
      console.log(JSON.stringify(sendingReq.data));
      setFriendStatus("declined");
      return sendingReq.data;
    } catch (err: any) {
      console.log("error getme");
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Unauthorized");
      }
      return "" as string;
    }
  };
  const acceptRequest = async () => {
    try {
      const sendingReq: AxiosResponse = await (
        await axiosToken()
      ).get("users/accept-friend-request-by-userid/" + userId);
      console.log(JSON.stringify(sendingReq.data));
      setFriendStatus("accepted");
      return sendingReq.data;
    } catch (err: any) {
      console.log("error getme");
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Unauthorized");
      }
      return "" as string;
    }
  };
  const getReqSendingStatus = async (): Promise<string> => {
    try {
      const sendingReq: AxiosResponse = await (
        await axiosToken()
      ).get(CHECK_SENDER_PATH + userId);
      return sendingReq.data;
    } catch (err: any) {
      console.log("error getme");
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 403) {
        setErrMsg("Invalid Credentials");
      } else {
        setErrMsg("Unauthorized");
      }
      return "" as string;
    }
  };
  const getSendingStatus = async () => {
    const senderStatus = await getReqSendingStatus();
    setSendingStatus(senderStatus);
  };

  useEffect(() => {
    if (friendStatus === "pending") {
      getSendingStatus();
    } else if (friendStatus === "declined") {
      getSendingStatus();
    } else setSendingStatus("");
  }, [friendStatus]);

  function printAchievements() {
    return isFriend ? (
      <Achievements />
    ) : (
      <p id="notFriend">Only friends can see achievements</p>
    );
  }

  useEffect(() => {
    const checkIfFriend = async () => {
      let friendList: FriendType[] = [];
      let profileUser: NeutralUser;
      let myProfile: NeutralUser;

      axiosInstance.current = await axiosToken();
      friendList = (await axiosInstance.current.get("/users/friend-list")).data;
      profileUser = (
        await axiosInstance.current.get("/users/profile/" + userId)
      ).data;
      myProfile = (await axiosInstance.current.get("/users/me")).data;
      if (profileUser.id === myProfile.id) setIsFriend(true);
      friendList.forEach((friend) => {
        if (friend.id === profileUser.id) setIsFriend(true);
      });
    };
    checkIfFriend();
  }, []);

  return (
    <div>
      <Headers />
      <Sidebar />
      {errMsg}

      <main className="userProfile">
        <div className={"container"}>
          {/* <div className='divprofilePicture'> */}
          <img
            id="profilePicture"
            className="profilePicture"
            src={picture}
            alt="profile_picture"
          />
          {/* </div> */}
          <div id="divprofileName" className="divprofileName">
            <p className="profileName">{user?.username?.slice(0, 15)}</p>
          </div>
          <Popup
            apparent={showConfirmation}
            title={popupTitle}
            content={popupContent}
            handleTrue={(e: any) => deleteRequest(true)}
            handleFalse={(e: any) => deleteRequest(false)}
          />
          <div className="profileFriendButton">
            {friendStatus === "accepted" && (
              <div className="cyan">
                <button
                  className="profileButtonCancel btn btn-primary"
                  onClick={handleUnfriendClick}
                  type="button"
                  data-toggle="modal"
                  data-target="#exampleModalCenter"
                >
                  Unfriend
                </button>
                {/* /* (
        <div className='profileConfirmPopup'>
          <p className='popupText'>
          Are you sure you want to remove this person from your friends list?
            This action is final and you will not be able to recover it.
          </p>
          <button className='profileConfirmYes'onClick={(e:any) => deleteRequest(true)}>Unfriend</button>
          <button className='profileConfirmNo'onClick={(e:any) => deleteRequest(false)}>Cancel</button>
        </div>
        )*/}
              </div>
            )}
            {/* //  <button onClick={deleteRequest}>Unfriend</button>} */}
            {friendStatus === "declined" && sendingStatus === "receiver" && (
              <button
                className="profileButtonAddFriend"
                onClick={acceptRequest}
              >
                Add friend +
              </button>
            )}
            {/* {friendStatus === "declined" && sendingStatus == "creator" && <button className='profileButtonWaiting' disabled>Not Accepted yet</button>} */}
            {friendStatus === "pending" && sendingStatus === "receiver" && (
              <>
                <button
                  className="profileButtonAddFriend"
                  onClick={acceptRequest}
                >
                  Accept req
                </button>
                <button className="profileButtonRefuse" onClick={refuseRequest}>
                  Reject Req
                </button>
              </>
            )}
            {friendStatus === "pending" && sendingStatus === "creator" && (
              <div>
                <button
                  id="profileButtonCancel"
                  className={"profileButtonCancel"}
                  onClick={handleUnWaitClick}
                >
                  Cancel
                </button>
              </div>
            )}
            {/* <button disabled>Pending</button>} */}
            {friendStatus === "" && userId != userSessionId ? (
              <button className="profileButtonAddFriend" onClick={AddFriend}>
                Add friend +
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <Stats/>
        <br />
        <br />
        {printAchievements()}
      </main>
    </div>
  );
};

export default UserProfile;
