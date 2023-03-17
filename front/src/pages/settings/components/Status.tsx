import { useEffect, useRef } from "react";
import style from "../../../styles/Status.module.css";
import { axiosToken } from "src/api/axios";
import { AxiosInstance } from "axios";
import { useParams } from "react-router-dom";

function Status() {
  const userId = useParams();
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const userStatus = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      axiosInstance.current = await axiosToken();
      await axiosInstance
        .current!.get("/users/profile/" + userId.userId)
        .then((response) => {
          userStatus.current = response.data.status === "ONLINE" ? true : false;
        console.log(userStatus);
        });
    };
    fetchData().catch(console.error);
  }, []);

  const GenStatus = () => {
    if (userStatus.current) {
      return (
        <>
          <div className={style.online_indicator}>
            <span className={style.online_blink}></span>
            </div>

          <h2 className={style.text}>Online</h2>
        </>
      );
    }
    return (
        <>
        <div className={style.offline_indicator}>
          <span className={style.offline_blink}></span>
          </div>

        <h2 className={style.text}>Offline</h2>
      </>
    );
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css?family=Rubik:400,500"
        rel="stylesheet"
      ></link>

      <div className={style.container}>
        {/* <div className={style.pop_up}>
          <div className={style.arrow_down}></div>
          <p>Click here & let's chat!</p>
        </div> */}
        <GenStatus/>
      </div>
    </>
  );
}

export default Status;
