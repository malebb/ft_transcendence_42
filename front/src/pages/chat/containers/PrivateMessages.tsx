// import { SocketContext } from "../context/socket.context";

import style from "./private.message.module.css";

function PrivateMessages() {
  function openMessage(): void {
    document.getElementById("myForm")!.style.display = "block";
  }

  function closeMessage(): void {
    document.getElementById("myForm")!.style.display = "none";
  }

  return (
    <div>
      <button className={style.openbutton} onClick={openMessage}>
        Send message
      </button>
      <div className={style.chatpopup} id="myForm">
        <form className={style.formcontainer}>
          {/* <label for="msg"><b>Message</b></label> */}
          <textarea
            placeholder="Type message..."
            className="msg"
            required
          ></textarea>
          <button type="submit" className="btn">
            Send
          </button>
          {/* <div>
            <div className={style.chatbox}>
              <div className={style.chatbox__support}>
                <div className={style.chatbox__header}>Chat support!</div>
                <div className={style.messages}>
                  <div>
                    <div className={style.messages__item__visitor}>Hi!</div>
                    <div className={style.messages__item__operator}>What is it?</div>.
                    <div className={style.messages__item__typing}>
                      <span className={style.messages__dot}></span>
                      <span className={style.messages__dot}></span>
                      <span className={style.messages__dot}></span>
                    </div>
                  </div>
                </div>
                <div className={style.chatbox__footer}>
                  <input type={style.text} placeholder="Write a message" />
                </div>
              </div>
              <div className={style.chatbox__button}>
                <button>I'm a button!</button>
              </div>
            </div>
          </div> */}
          <button type="button" className={style.btn} onClick={closeMessage}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivateMessages;
