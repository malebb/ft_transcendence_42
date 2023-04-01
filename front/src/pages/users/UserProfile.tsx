import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AxiosResponse, AxiosInstance, AxiosHeaders } from "axios";
import { axiosAuthReq, HTTP_METHOD, axiosPrivate } from "../../api/axios";
import "../../styles/UserProfile.css";
import Sidebar from "../../components/Sidebar";
import Headers from "../../components/Headers";
import Stats from "./components/Stats";
import Achievements from "./components/Achievements";
import BlockButton from './components/BlockButton';
import { FriendType } from "../friends/Friends";
import Popup from "../../components/Popup";
import AuthContext from "src/context/TokenContext";
import Status from "../settings/components/Status";
import PrivateMessages from "../chat/containers/PrivateMessages";
import { User } from 'ft_transcendence';


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

const UserProfile = () => {
  
  const { paramUserId } = useParams();

  const { userId } = useContext(AuthContext);
  const [user, setUser] = useState<NeutralUser>();
  const [picture, setPicture] = useState("");
  const [friendStatus, setFriendStatus] = useState<string>("");
  const [isFriend, setIsFriend] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState("");

  const [sendingStatus, setSendingStatus] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<string>("");

  const axiosInstance = useRef<AxiosInstance | null>(null);
  const [isUser, setIsUser] = useState<boolean>(false);
  const navigate = useNavigate();

  const popupTitle = "WARNING";
  const popupContentRemoveFriend =
    "Are you sure you want to remove this person from your friends list? This action is final and you will not be able to recover it.";
  const popupContentRemoveWait =
    "Are you sure you want to remove this person from your waiting list? This action is final and you will not be able to recover it.";
  // const userSessionId = userId!;

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
    /*const response: AxiosResponse = await axiosMain.get(ADD_FRIEND_PATH + paramUserId, {
            headers:{
                'Authorization': 'Bearer ' +  token
            }
        })*/
    try {
      const response: AxiosResponse = await axiosPrivate.get(ADD_FRIEND_PATH + paramUserId);
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

  const AddFriend = async () => {
    const newstatus = await AddFriendReq();
    setFriendStatus(newstatus);
  };

  // const getUserProfile = async () => {
  //   try {
  //     const token = getToken();
  //     const response: AxiosResponse = axiosPrivate).get(
  //       "users/profile/" + paramUserId,
  //       {
  //         headers: {
  //           Authorization: "Bearer " + token["access_token"],
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (err: any) {
  //     console.log("error getme");
  //     if (!err?.response) {
  //       setErrMsg("No Server Response");
  //     } else if (err.response?.status === 403) {
  //       setErrMsg("Invalid Credentials");
  //     } else {
  //       setErrMsg("Unauthorized");
  //     }
  //     return {} as NeutralUser;
  //   }
  // };

  // const checkIsFriend = async (id: number) => {
  //   try {
  //     const token = getToken();
  //     const response: AxiosResponse = axiosPrivate).get(
  //       GET_STATUS_PATH + id.toString(),
  //       {
  //         headers: {
  //           Authorization: "Bearer " + token["access_token"],
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (err: any) {
  //     console.log("error getme");
  //     if (!err?.response) {
  //       setErrMsg("No Server Response");
  //     } else if (err.response?.status === 403) {
  //       setErrMsg("Invalid Credentials");
  //     } else {
  //       setErrMsg("Unauthorized");
  //     }
  //     return "" as string;
  //   }
  // };
//TODO change axiosAuthToken
  useEffect(() => {
		if (!/^[0-9]*$/.test(paramUserId!))
		{
			navigate('/404');
		}

  }, [paramUserId, navigate])
  useEffect(() => {
    const treatData = async () => {
      const profile = await axiosAuthReq(HTTP_METHOD.GET, GET_USER_PROFILE + paramUserId, {} as AxiosHeaders, {}, setErrMsg, setUser);
      if (profile === undefined) return ;
      if (profile !== undefined){
        if (validURL(profile.profilePicture)) setPicture(profile.profilePicture);
        else
          setPicture(
            GET_PROFILE_PICTURE + profile.profilePicture.split("/")[2]
          );
        await axiosAuthReq(HTTP_METHOD.GET, GET_STATUS_PATH + paramUserId, {} as AxiosHeaders, {}, setErrMsg, setFriendStatus);
      }
    };
    treatData();
  }, [paramUserId]);

  const deleteRequest = async (confirmed: boolean): Promise<void> => {
    if (confirmed) {
      try {
        await axiosPrivate.get("users/destroy-friend-request-by-userid/" + paramUserId);
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
      const sendingReq: AxiosResponse = await axiosPrivate.get("users/decline-friend-request-by-userid/" + paramUserId);
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
      const sendingReq: AxiosResponse = await axiosPrivate.get("users/accept-friend-request-by-userid/" + paramUserId);
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
  const getReqSendingStatus = useCallback(async (): Promise<string> => {
    try {
      const sendingReq: AxiosResponse = await axiosPrivate.get(CHECK_SENDER_PATH + paramUserId);
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
  }, [paramUserId]);

  const getSendingStatus = useCallback(async () => {
    const senderStatus = await getReqSendingStatus();
    setSendingStatus(senderStatus);
  }, [getReqSendingStatus]);

  useEffect(() => {
    if (friendStatus === "pending") {
      getSendingStatus();
    } else if (friendStatus === "declined") {
      getSendingStatus();
    } else setSendingStatus("");
  }, [friendStatus, getSendingStatus]);

  function printAchievements() {
    return isFriend ? (
      <Achievements />
    ) : (
      <p id="notFriend">Only friends can see achievements</p>
    );
  }

  useEffect(() => {
    const checkIfFriend = async () => {
		try
		{
			let friendList: FriendType[] = [];
			let myProfile: NeutralUser;
	
			axiosInstance.current = axiosPrivate;
			friendList = (await axiosInstance.current.get("/users/friend-list")).data;
   			myProfile = (await axiosInstance.current.get("/users/me")).data;
   			if (Number(paramUserId) === myProfile.id)
			{
		 		setIsFriend(true);
				return ;
			}
			let friendFound = false;
			friendList.forEach((friend) => {
	        if (friend.id === Number(paramUserId))
			{
				setIsFriend(true);
				friendFound = true;
				return ;
			}
   	   		});
			if (!friendFound)
				setIsFriend(false);
		}
		catch (error: any)
		{
			console.log('error: ', error);
		}
    };
    checkIfFriend();
  }, [paramUserId]);

  useEffect(() => {
		const checkIfUserExist = async () =>
		{
			try
			{
				axiosInstance.current = axiosPrivate;
				const user: AxiosResponse = (await axiosInstance.current.get('users/profile/' + paramUserId));
				if (user.data)
				{
					setIsUser(true);
				}
			}
			catch (error: any)
			{
				console.log('error :', error);
			}
		}
		checkIfUserExist();
  }, [paramUserId]);

  function openMessage(): void {
    document.getElementById("myForm")!.style.display = "block";
	const chatContainer = document.getElementById('chatContainer');
	chatContainer!.scrollTop = chatContainer!.scrollHeight;
  }

	function MessageSection()
	{
  		const [currentUser, setCurrentUser] = useState<User | null>();

		useEffect(() => {
			const initCurrentUser = async () =>
			{
				try
				{
				axiosInstance.current = axiosPrivate;
				const response: AxiosResponse = await axiosInstance.current.get('/users/me');
				setCurrentUser(response.data);
				}
				catch (error: any) { console.log('error: ', error)}
			}
			initCurrentUser();
		}, []);

		if (currentUser && currentUser.id !== Number(paramUserId))
		{
		 return (
		 <>
			 <img className="openMsgbutton" onClick={openMessage} src="http://localhost:3000/images/msgLogo.png" draggable={false} alt="openMessage" />
				 <div className="pop_up">
					 <div className="arrow_down"></div>
		 			<p>Click here & let's chat !</p>
				</div>
		  		<PrivateMessages />
		  </>
		  );
		}
		else
			return (<></>);
	}

	function printProfile()
	{
		if (isUser)
		{
			return (
			<>
					<div className={"container"}>
						<img
							id="profilePicture"
							className="profilePicture"
							src={picture}
							alt="profile_picture"
						/>
					<div id="divprofileName" className="divprofileName">
						<p className="profileName">{user?.username?.slice(0, 15)}</p>
						<Status id={Number(paramUserId)} />
						<MessageSection />
					</div>
					<Popup
						apparent={showConfirmation}
						title={popupTitle}
						content={popupContent}
						handleTrue={() => deleteRequest(true)}
						handleFalse={() => deleteRequest(false)}
					/>
						<div className="actionsOnUser">
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
						</div>
							)}
							{friendStatus === "declined" && sendingStatus === "receiver" && (
							<button
								className="profileButtonAddFriend"
								onClick={acceptRequest}
							>
								Add friend +
							</button>
							)}
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
					{friendStatus === "" && paramUserId !== userId?.toString() ? (
							<button className="profileButtonAddFriend" onClick={AddFriend}>
								Add friend +
							</button>
							) : (
								<></>
								)}
					</div>
					{(paramUserId !== userId?.toString()) ? <BlockButton userIdToBlock={Number(paramUserId)}/>: <></>}
					</div>

					</div>
						<br />
						<br />
						<br />
						<br />
						<Stats />
						<br />
				<br />
			{printAchievements()}
		</>);
	}
	else
		return (<p style={{textAlign: "center", marginTop: 70}}>This user does not exist</p>);
	}

  return (
    <div>
      <Headers />
      <Sidebar />
      {errMsg}

      <main className="userProfile">
		{printProfile()}
      </main>
    </div>
  );
};

export default UserProfile;
