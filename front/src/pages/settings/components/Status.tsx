import { useEffect, useRef, useState, useContext } from "react";
import { AxiosInstance } from "axios";

import { AxiosResponse } from "axios";
import styleStatus from "../../../styles/status.module.css";
import { SocketContext } from '../../../context/SocketContext';
import { Activity } from 'ft_transcendence';
import useAxiosPrivate from "src/hooks/usePrivate";
import { FriendType } from "../../friends/Friends";

function Status({ id }: { id: number }) {
	const axiosPrivate = useAxiosPrivate();
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const [userStatus, setUserStatus] = useState<Activity>(Activity["OFFLINE" as keyof typeof Activity]);
  const currentUser = useRef<boolean>(false);
  const socket = useContext(SocketContext);
  const statusTimeout =  useRef<ReturnType<typeof setTimeout>>();
  const [isFriend, setIsFriend] = useState<boolean>(false);


	useEffect(() =>
	{
    	const checkIfFriend = async () => {
			try
			{

				axiosInstance.current = axiosPrivate;
				const friendList: AxiosResponse = await axiosInstance.current.get("/users/friend-list");
				const currentUser: AxiosResponse = await axiosInstance.current.get("/users/me");
				let isFriendFound = false;
				if (currentUser.data.id === id)
				{
					setIsFriend(true);
					return ;
				}
				friendList.data.forEach((friend: FriendType) => {
			        if (friend.id === id)
					{
						setIsFriend(true);
						isFriendFound = true;
						return ;
					}
	   	   		});
				if (!isFriendFound)
					setIsFriend(false);
			}
			catch (error: any)
			{
				console.log('error: ', error);
			}
		};
    	checkIfFriend();
	}, [id, axiosPrivate]);

  useEffect(() => {
    const fetchData = async () => {
      axiosInstance.current = axiosPrivate;
      await axiosInstance
        .current!.get("/users/profile/" + id)
        .then((response) => {
          setUserStatus(response.data.status);
        });
      axiosInstance.current = axiosPrivate;
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current =
          response.data.id === id ? true : false;
      });
    };
    fetchData().catch(console.error);
  }, [id, axiosPrivate]);

	useEffect(() => {
		const initSocket = async () =>
		{
			socket.on('CHANGE_STATUS', (data) =>
			{
				if (data.id === id)
				{
					clearTimeout(statusTimeout.current);
					statusTimeout.current = setTimeout(async () => {

      					axiosInstance.current = axiosPrivate;
	    				await axiosInstance.current!.get("/users/profile/" + id).then((response) =>
						{
							if (response.data.status !== userStatus)
								setUserStatus(response.data.status);
    					});
					}, 1000)
				}
			});
		}
		initSocket();
	}, [id, userStatus, socket, axiosPrivate]);

  const GenStatus = () => {

	if (isFriend)
	{
		switch (userStatus)
		{
			case 'ONLINE':
				  return (
					  <>
						  <div className={styleStatus.online_indicator}>
							  <span className={styleStatus.online_blink}></span>
						  </div> Online</>);
			case 'OFFLINE':
				return (
					<>
   	     				<div className={styleStatus.offline_indicator}></div>
        				<div className={styleStatus.text}>Offline</div>
				</>);

			case 'IN_GAME':
				return (
					<>
   	   		  			<div className={styleStatus.in_game_indicator}></div>
						<div className={styleStatus.text}>In Game</div>
					</>);
    	}
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
