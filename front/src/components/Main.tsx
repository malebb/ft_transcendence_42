import React from 'react';
//import '../styles/App.css';
import Headers from './Headers';
import Nav from './Nav';
import Log from './Log';
import Canvas from './Canvas';

function Main() {
  return (
    <div className="App">
      <div className='static'>
      <Headers/>
      {sessionStorage.getItem("token") ? <Nav/> : <Log/>}
      </div>
      <Canvas/>
    </div>
  );
}

export default Main;
