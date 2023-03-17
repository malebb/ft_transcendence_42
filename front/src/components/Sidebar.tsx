import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";
import {
  faUser,
  faUserGroup,
  faClockRotateLeft,
  faCommentDots,
  faGears,
  faGamepad,
  faTrophy,
  faRightFromBracket,
  faChain,
} from "@fortawesome/free-solid-svg-icons";
import {} from "@fortawesome/free-solid-svg-icons";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const userSessionId = JSON.parse(localStorage.getItem("id")!);

  return (
    <>
      {!(localStorage.getItem("tokens")) ? (
        <></>
      ) : (
        <nav className="Sidebar">
          <Link className="Sidebar-Link" to={"/user/" + userSessionId}>
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon className="fa-2xl svg-definecolor" icon={faUser} />
            <p className="link-text">Profile</p>
            {/* </div> */}
          </Link>
          <Link className="Sidebar-Link" to="/history">
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon
              className="fa-2xl svg-definecolor"
              icon={faClockRotateLeft}
            />
            <p className="link-text">History</p>
            {/* </div> */}
          </Link>
          <Link className="Sidebar-Link" to="/friends">
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon
              className="fa-2xl svg-definecolor"
              icon={faUserGroup}
            />
            <p className="link-text">Friends</p>
            {/* </div> */}
          </Link>
          <Link className="Sidebar-Link" to="/chat">
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon
              className="fa-2xl svg-definecolor"
              icon={faCommentDots}
            />
            <p className="link-text">Chat</p>
            {/* </div> */}
          </Link>
          <Link className="Sidebar-Link" to="/user">
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon
              className="fa-2xl svg-definecolor"
              icon={faGears}
            />
            <p className="link-text">Settings</p>
            {/* </div> */}
          </Link>
          <Link className="Sidebar-Link" to="/games">
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon
              className="fa-2xl svg-definecolor"
              icon={faGamepad}
            />
            <p className="link-text">Watch Games</p>
            {/* </div> */}
          </Link>
          <Link className="Sidebar-Link" to="/logout">
            {/* <div className='div-sidebar'> */}
            <FontAwesomeIcon
              className="fa-2xl svg-definecolor"
              icon={faRightFromBracket}
            />
            <p className="link-text">Logout</p>
            {/* </div> */}
          </Link>
        </nav>
      )}
    </>
  );
};

export default Sidebar;
