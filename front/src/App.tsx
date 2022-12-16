import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Headers from './Headers';
import Nav from './Nav';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <div className='static'>
      <Headers/>
      <Nav/>
      </div>
      <Routes>
      <Route path='/user'/>
      <Route path='/history'/>
      <Route path='/friends'/>
      </Routes>
    </div>
  );
}

export default App;
