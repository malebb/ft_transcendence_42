import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Headers.css'

const Log = () => {
  return (
    <div className='Nav'>
      <div className='Nav-container'>
        <Link className="Nav-Link in" to='/signin'>Sign in</Link>
        <Link className="Nav-Link up" to='/signup'>Sign up</Link>
      </div>
    </div>
  )
}

export default Log;