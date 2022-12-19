import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children } : {children: JSX.Element}) => {
  return (<></>
    // jwt ? children : <Navigate to="/login" />
  );
}

export default PrivateRoute