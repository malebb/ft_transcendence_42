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
<<<<<<< HEAD
      {sessionStorage.getItem("tokens") ? <Nav/> : <Log/>}
      <Canvas/>
=======
      {sessionStorage.getItem("token") ? <Nav/> : <Log/>}
>>>>>>> master
      </div>
      <Canvas/>
    </div>
  );
}

export default Main;
