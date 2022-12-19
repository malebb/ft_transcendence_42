import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Headers from './Headers';
import Login from './Login';
import Nav from './Nav';

function App() {
  return (
    <div className="App">
      <div className='static'>
      <Headers/>
      <Nav/>
      </div>
      <Routes>
      <Route path='/user'/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/history'/>
      <Route path='/friends'/>
      </Routes>
    </div>
  );
}

export default App;
