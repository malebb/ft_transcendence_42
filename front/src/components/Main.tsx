import React from 'react';
import '../styles/App.css';
import Headers from './Headers';
import Nav from './Nav';
import Log from './Log';
import Canvas from './Canvas';
import axios from 'axios';
import { getRefreshHeader } from 'src/api/axios';
import Sidebar from './Sidebar';
import backgroundVideo from '../content/background.mp4'

function Main() {
  
	const userSessionId = JSON.parse(sessionStorage.getItem('id')!);
  const onClick = async() =>{
    console.log(getRefreshHeader());
  const new_jwt = await axios.post('http://localhost:3333/auth/refresh',{},
  {
    headers: {
      'Authorization' : getRefreshHeader(),
    },
  });
  console.log(new_jwt.data)
}
  return (
    <div className="App">
      <Headers/>
      <div className='Menu'>
        <Sidebar/>
      </div> 
     {(userSessionId === null) ? (<video autoPlay={true} muted={true} loop={true} id='old-game-video'><source src={backgroundVideo} type='video/mp4'/></video>):(<Canvas/>)}
    </div>
  );
}

export default Main;
