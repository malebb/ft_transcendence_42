import { useEffect, useRef, useState, useContext } from "react";
import { axiosToken } from "src/api/axios";
import { AxiosInstance } from "axios";
import { useParams } from "react-router-dom";
import PrivateMessages from "../../chat/containers/PrivateMessages";

import styleStatus from "../../../styles/Status.module.css";
import styleMessage from "../../../styles/private.message.module.css";
import { SocketContext } from '../../../context/SocketContext';
import { Activity } from 'ft_transcendence';

// https://stackoverflow.com/questions/58315741/how-to-check-online-user-in-nodejs-socketio
//! ERROR: render offline une fraction de seconde quand refresh

function Status({ id }: { id: string }) {
  const userId = useParams();
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const [userStatus, setUserStatus] = useState<Activity>(Activity["OFFLINE" as keyof typeof Activity]);
  const currentUser = useRef<boolean>(false);
  const socket = useContext(SocketContext);

  function openMessage(): void {
    document.getElementById("myForm")!.style.display = "block";
  }

  useEffect(() => {
    const fetchData = async () => {
      axiosInstance.current = await axiosToken();
      await axiosInstance
        .current!.get("/users/profile/" + userId.userId)
        .then((response) => {
          setUserStatus(response.data.status);
        });
      axiosInstance.current = await axiosToken();
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current =
          response.data.id === Number(userId.userId) ? true : false;
        console.log(
          "response.data.id = " + response.data.id + typeof response.data.id
        );
        console.log("userId.userId = " + userId.userId + typeof userId.userId);
      });
    };

    fetchData().catch(console.error);
  }, [id]);

	useEffect(() => {
		const initSocket = async () =>
		{
      		axiosInstance.current = await axiosToken();
      		const currentUser = await axiosInstance.current!.get("/users/me");
			socket.on('CHANGE_STATUS', (data) =>
			{
				if (data.id === Number(id))
					setUserStatus(data.status);
			});
		}
		initSocket();
	}, [id]);

  const GenStatus = () => {
    switch (userStatus)
	{
		case 'ONLINE':

	      if (!currentUser.current) {
			  return (
				  <>
					  <div className={styleStatus.online_indicator}>
						  <span className={styleStatus.online_blink}></span>
					  </div>
					  <button className={styleMessage.openbutton} onClick={openMessage}>
					  Online
					  </button>
					  <div className={styleStatus.pop_up}>
						  <div className={styleStatus.arrow_down}></div>
						  <p>Click here & let's chat !</p>
					  </div>
					  <PrivateMessages />
				  </>);
		}
			return (
				  <>
				  <div className={styleStatus.online_indicator}>
				 	 <span className={styleStatus.online_blink}></span>
				  </div>
				  <div className={styleStatus.text}>Online</div>
				  </>
				 );

	case 'OFFLINE':
		return (
			<>
   	     		<div className={styleStatus.offline_indicator}></div>
        		<div className={styleStatus.text}>Offline</div>
			</>);

	case 'IN_GAME':
	return (
			<>
   	     		<div className={styleStatus.offline_indicator}></div>
        		<div className={styleStatus.text}>In Game</div>
			</>);
    }
	return (<></>);
  };

  return (
    <>
      <GenStatus />
    </>
  );
}

export default Status;
