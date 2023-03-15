import { SocketContext } from "../context/socket.context";

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
      <button className="open-button" onClick={openMessage}>
        Send message
      </button>
      <div className="chat-popup" id="myForm">
        <form className="form-container">
          {/* <label for="msg"><b>Message</b></label>
          <textarea
            placeholder="Type message..."
            className="msg"
            required
          ></textarea>
          <button type="submit" className="btn">
            Send
          </button> */}
              <div>
<div className={style.chatbox}>
    <div className="chatbox__support">
        <div className="chatbox__header">
            Chat support!
        </div>
        <div className="messages">
            <div>
                <div className="messages__item--visitor">
                    Hi!
                </div>
                <div className="messages__item--operator">
                    What is it?
                </div>
                .<div className="messages__item--typing">
                    <span className="messages__dot"></span>
                    <span className="messages__dot"></span>
                    <span className="messages__dot"></span>
                </div>
            </div>
        </div>
        <div className="chatbox__footer">
            <input type="text" placeholder="Write a message"/>
        </div>
    </div>
    <div className="chatbox__button">
        <button>I'm a button!</button>
    </div>
</div>
    </div>
          <button type="button" className="btn cancel" onClick={closeMessage}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivateMessages;
