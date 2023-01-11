import React from 'react'
import { Link } from 'react-router-dom'

const Log = () => {
  return (
    <div className='Nav'>
      <Link className="Nav-Link" to='/signin'>Sign in</Link>
      <Link className="Nav-Link" to='/signup'>Sign up</Link>
    </div>
  )
}

export default Log;