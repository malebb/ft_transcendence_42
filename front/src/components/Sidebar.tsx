import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Link } from 'react-router-dom'
import { faUser, faUserGroup, faClockRotateLeft, faCommentDots, faGears, faGamepad, faTrophy, faRightFromBracket, faChain} from '@fortawesome/free-solid-svg-icons';
import {  } from '@fortawesome/free-solid-svg-icons';
import '../styles/Sidebar.css'

const Sidebar = () => {
	const userSessionId = JSON.parse(sessionStorage.getItem('id')!);

  return (
    <nav className='Sidebar'> 
      <Link className="Sidebar-Link" to={'/user/' + userSessionId}>
        {/* <div className='div-sidebar'> */}
        <FontAwesomeIcon className='fa-2xl svg-definecolor' icon={faUser}/>
          <p className='link-text'>Profile</p>
        {/* </div> */}
      </Link>
      <Link className="Sidebar-Link" to='/history'>
        {/* <div className='div-sidebar'> */}
          <FontAwesomeIcon className='fa-2xl svg-definecolor' icon={faClockRotateLeft}/>
          <p className='link-text'>History</p>
        {/* </div> */}
      </Link>
      <Link className="Sidebar-Link" to='/friends'>
        {/* <div className='div-sidebar'> */}
          <FontAwesomeIcon className='fa-2xl svg-definecolor' icon={faUserGroup} />
          <p className='link-text'>Friends</p>
        {/* </div> */}
      </Link>
      <Link className="Sidebar-Link" to='/chat'>
        <div className='div-sidebar'>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg"  width="50px" height="50px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000" >
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
<g><path d="M990,460.5c0,228.2-219.5,413.8-490.4,413.8c-75,0-145.3-14.2-209.3-39.5L104.8,953.3L134,736.9C57.4,663.5,10,566.3,10,460.5C10,232.3,229.5,46.7,500.4,46.7C770.5,46.7,990,232.3,990,460.5z M162.4,863.3l105-66.3l40.3-3.9c60,23.7,124.8,36.3,192.7,36.3c245.6,0,445.4-165.8,445.4-368.8S746,91.7,500.4,91.7C254.8,91.7,55,256.8,55,460.5c0,89.2,39.5,176.1,110.6,243.2l13.4,38.7L162.4,863.3z"/><path d="M228,441.6c0,31.8,25.8,57.6,57.6,57.6c31.8,0,57.6-25.8,57.6-57.6s-25.8-57.6-57.6-57.6C253.8,383.9,228,409.7,228,441.6L228,441.6z"/><path d="M456.2,441.6c0,31.8,25.8,57.6,57.6,57.6c31.8,0,57.6-25.8,57.6-57.6s-25.8-57.6-57.6-57.6C482,383.9,456.2,409.7,456.2,441.6L456.2,441.6z"/><path d="M684.4,441.6c0,31.8,25.8,57.6,57.6,57.6c31.8,0,57.6-25.8,57.6-57.6s-25.8-57.6-57.6-57.6C710.2,383.9,684.4,409.7,684.4,441.6L684.4,441.6z"/></g>
</svg>
        </div>
      </Link>
      <Link className="Sidebar-Link" to='/user'>
        {/* <div className='div-sidebar'> */}
          <FontAwesomeIcon className='fa-2xl svg-definecolor' icon={faGears}/>
          <p className='link-text'>Settings</p>
        {/* </div> */}
      </Link>
      <Link className="Sidebar-Link" to='/games'>
        {/* <div className='div-sidebar'> */}
          <FontAwesomeIcon className='fa-2xl svg-definecolor' icon={faGamepad}/>
          <p className='link-text'>Watch Games</p>
        {/* </div> */}
      </Link>
      <Link className="Sidebar-Link" to='/games'>
        {/* <div className='div-sidebar'> */}
          <FontAwesomeIcon className='fa-2xl svg-definecolor' icon={faRightFromBracket}/>
          <p className='link-text'>Logout</p>
        {/* </div> */}
      </Link>

    </nav>
  )
}

export default Sidebar
