import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Socket, io } from "socket.io-client";
import { Message, MessageType, User } from "ft_transcendence";
import { AxiosInstance, AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import alertStyle from "../../../styles/alertBox.module.css";

import style from "../../../styles/private.message.module.css";
import "./message.style.css";
import styleInput from "../inputs/InputButton.module.css";
import { trimUsername } from "../../../utils/trim";
import { printInfosBox } from "../../../utils/infosBox";
import useAxiosPrivate from "src/hooks/usePrivate";
import AuthContext from "src/context/TokenContext";

function PrivateMessages() {
  const { token } = useContext(AuthContext);
  const axiosPrivate = useAxiosPrivate();
  const [stateMessages, setStateMessages] = useState<Message[]>([]);
  const currentUser = useRef<User | null>(null);
  const friend = useRef<User | null>(null);
  const room = useRef<object | null>(null);
  const axiosInstance = useRef<AxiosInstance | null>(null);
  const socket = useRef<Socket | null>(null);
  const friendId = useParams();
  const [inputMessage, setInputMessage] = useState("");
  const [initSocket, setInitSocket] = useState<boolean>(false);
  const [challenges, setChallenges] = useState<AxiosResponse | null>(null);
  let newMessage: Message;

  function closeMessage(): void {
    document.getElementById("myForm")!.style.display = "none";
  }

  const scrollToBottom = () => {
    document.getElementById("chatContainer")?.scrollTo({
      top: document.getElementById("chatContainer")?.scrollHeight,
      behavior: "smooth",
    });
  };

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [stateMessages]);

  const fetchChallenge = useCallback(async () => {
    axiosInstance.current = axiosPrivate;
    await axiosInstance
      .current!.get("/challenge/myChallenges")
      .then((response) => {
        if (response.data) setChallenges(response);
      })
      .catch((e) => {
        console.log("error: ", e);
      });
  }, [axiosPrivate]);

  useEffect(() => {
    const fetchData = async () => {
      axiosInstance.current = axiosPrivate;
      await axiosInstance.current!.get("/users/me").then((response) => {
        currentUser.current = response.data;
      });
      axiosInstance.current = axiosPrivate;
      await axiosInstance
        .current!.get("/users/profile/" + friendId.paramUserId)
        .then((response) => {
          friend.current = response.data;
        });
    };
    const initPrivateChat = async () => {
      try {
        await fetchData().catch(console.error);
        socket.current = io("ws://localhost:3333/chat", {
          transports: ["websocket"],
          forceNew: true,
          upgrade: false,
          auth: {
            token: token!.access_token,
          },
        });
        socket.current!.on("connect", async () => {
          socket.current?.emit("JOIN_PRIVATE_ROOM", {
            senderId: currentUser.current!.id,
            receiverId: friend.current!.id,
          });
          const joinRoom = async (): Promise<object> => {
            return await new Promise(function (resolve) {
              socket.current!.on("GET_ROOM", async (data) => {
                // https://stackoverflow.com/questions/51712030/promise-throwing-error-because-it-cannot-access-this
                return resolve(data);
              });
            });
          };
          joinRoom().then(function (data) {
            room.current = data;
            const getAllMessages = async () => {
              axiosInstance.current = axiosPrivate;
              await axiosInstance
                .current!.get(
                  "/message/private/" + JSON.stringify(room.current)
                )
                .then((response) => {
                  setStateMessages(response.data);
                })
                .catch((e) => {
                  console.log("error: ", e);
                });
            };
            getAllMessages();
            setInitSocket(true);
          });

          socket.current!.on(
            "RECEIVE_PRIVATE_ROOM_MESSAGE",
            async function (message: Message) {
              setStateMessages((stateMessages) => [...stateMessages, message]);
              if (message.type === "INVITATION") fetchChallenge();
            }
          );
        });
      } catch (error) {
        console.log(error);
      }
      return () => {
        socket.current?.disconnect();
      };
    };
    initPrivateChat().catch(console.error);
  }, [friendId.paramUserId, axiosPrivate, fetchChallenge, token]);

  useEffect(() => {
    fetchChallenge();
  }, [friendId.userId, fetchChallenge]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inputMessage?.length) return;

    const dateTS = new Date();
    newMessage = {
      user: currentUser.current!,
      message: inputMessage,
      sendAt: dateTS,
      type: MessageType["STANDARD" as keyof typeof MessageType],
      challengeId: 0,
    };
    socket.current!.emit("SEND_PRIVATE_ROOM_MESSAGE", {
      msg: newMessage,
      room: room.current,
      senderId: currentUser.current!.id,
      receiverId: friend.current!.id,
    });
    setStateMessages([...stateMessages, newMessage]);
    setInputMessage("");
  }

  const GenMessages = () => {
    const genDate = (date: Message): string => {
      const newDate = new Date(date.sendAt);
      return `${("0" + newDate.getHours()).slice(-2)}:${(
        "0" + newDate.getMinutes()
      ).slice(-2)}`;
    };

    const goToInvitation = (challengeId: number) => {
      window.location.href = "http://localhost:3000/challenge/" + challengeId;
    };

    const isChallengeFinished = (challengeId: number): boolean => {
      if (challenges && challenges.data) {
        for (let i = 0; i < challenges.data.length; ++i) {
          if (challenges.data[i].id === challengeId) return false;
        }
      }
      return true;
    };

    const genMessage = (isCurrentUser: boolean, newMessage: Message) => {
      if (!isCurrentUser) {
        return (
          <>
            <div className="chat-container-receiver">
              <div className="chat-text-container-receiver">
                <span className="chatUsername">
                  {trimUsername(newMessage?.user?.username, 8)}
                </span>
                <div className="dot">{":"}</div>
                <p className="chat-text">{newMessage.message}</p>
                {newMessage.type === "INVITATION" &&
                !isChallengeFinished(newMessage.challengeId) ? (
                  <button
                    className={style.invitationBtn}
                    onClick={() => goToInvitation(newMessage.challengeId)}
                  >
                    join
                  </button>
                ) : (
                  <></>
                )}
              </div>
              <span className="date">{genDate(newMessage)}</span>
            </div>
          </>
        );
      }
      return (
        <div className="chat-container-sender">
          <span className="date">{genDate(newMessage)}</span>
          <div className="chat-text-container-sender">
            <span className="chatUsername">
              {trimUsername(newMessage?.user?.username, 8)}
            </span>
            <div className="dot">{":"}</div>
            <p className="chat-text">{newMessage.message}</p>
          </div>
        </div>
      );
    };

    return (
      <>
        {stateMessages?.map((message, index) => {
          const isCurrentUser =
            currentUser.current!.username === message?.user?.username;

          return (
            <div key={index + 1} className="chat-wrapper">
              {genMessage(isCurrentUser, message)}
            </div>
          );
        })}
      </>
    );
  };

  const createInvitation = async (member: User, powerUpMode: boolean) => {
    try {
      axiosInstance.current = axiosPrivate;
      const challengeResponse = await axiosInstance.current.post(
        "/challenge/",
        { powerUpMode: powerUpMode, receiverId: member.id },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      socket.current!.emit("SEND_PRIVATE_ROOM_MESSAGE", {
        msg: {
          user: currentUser.current,
          message: "Join me for a game !",
          sendAt: new Date(),
          type: "INVITATION",
          challengeId: challengeResponse.data,
        },
        room: room.current,
        senderId: currentUser.current!.id,
        receiverId: member.id,
        type: MessageType["INVITATION" as keyof typeof MessageType],
      });
      window.location.href =
        "http://localhost:3000/challenge/" + challengeResponse.data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        printInfosBox("You are already playing in another game");
      }
    }
  };

  const selectMode = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div id={alertStyle.boxContainer}>
            <h1>Challenge {trimUsername(friend.current!.username, 15)}</h1>
            <p>Select a pong mode</p>
            <div id={alertStyle.alertBoxBtn}>
              <button
                onClick={() => {
                  createInvitation(friend.current!, false);
                  onClose();
                }}
              >
                normal
              </button>
              <button
                onClick={() => {
                  createInvitation(friend.current!, true);
                  onClose();
                }}
              >
                power-up
              </button>
            </div>
          </div>
        );
      },
      keyCodeForClose: [8, 32, 13],
    });
  };
  const DisplayMessages = () => {
    if (initSocket === true) return <GenMessages />;
    return <></>;
  };

  return (
    <div>
      <div className={style.chatpopup} id="myForm">
        <button
          type="button"
          className={style.close}
          onClick={closeMessage}
        ></button>
        <div className={style.formcontainer} id="chatContainer">
          <DisplayMessages />
        </div>

        <form id="myForm" onSubmit={handleSubmit} className={style.sendInput}>
          <textarea
            name="messageInput"
            placeholder="Write here..."
            autoComplete="off"
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            className={styleInput.textarea}
          ></textarea>
          <button type="submit">SEND</button>
          <img
            className={style.challengeLogo}
            src="http://localhost:3000/images/challenge.png"
            alt={"Challenge"}
            title="Challenge"
            width="20"
            height="22"
            onClick={() => selectMode()}
          />{" "}
          : <></>
        </form>
      </div>
    </div>
  );
}

export default PrivateMessages;

/*
notes: 
  Read the form data
  https://stackoverflow.com/questions/36683770/how-to-get-the-value-of-an-input-field-using-reactjs
  const form = new FormData(event.target);
  const form = (document.getElementsByTagName("messageInput")[1] as HTMLInputElement).value;

se debarasser de any :
https://freshman.tech/snippets/typescript/fix-value-not-exist-eventtarget/
https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/

*/
