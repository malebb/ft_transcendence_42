import { SocketContext } from "../context/socket.context";

import "./button.module.css";

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
          {/* <label for="msg"><b>Message</b></label> */}
          <textarea
            placeholder="Type message..."
            className="msg"
            required
          ></textarea>
          <button type="submit" className="btn">
            Send
          </button>
          <button type="button" className="btn cancel" onClick={closeMessage}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivateMessages;
