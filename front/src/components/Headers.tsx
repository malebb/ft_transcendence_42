import React from 'react'
import Nav from './Nav'
import Log from './Log'
import HeadersTitle from './HeadersTitle'
import '../styles/Headers.css'

const Headers = () => {
/*
    return(
        <div className="Headers">
            <Link className='Header-Link' to='/'>Transcendence</Link>
        </div>
    )
	*/
  return (
      <div className='static_header'>
      <HeadersTitle/>
      {sessionStorage.getItem("tokens") ? <Nav/> : <Log/>}
      </div>
  )
}

export default Headers
