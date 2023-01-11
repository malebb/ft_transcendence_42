import React from 'react';
import logo from './logo.svg';
import '../styles/App.css';
import Headers from './Headers';
import Nav from './Nav';
import Log from './Log';

function Main() {
  return (
    <div className="App">
      <div className='static'>
      <Headers/>
      {sessionStorage.getItem("token") ? <Nav/> : <Log/>}
      </div>
    </div>
  );
}

export default Main;
