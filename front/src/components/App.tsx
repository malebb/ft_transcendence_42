import React from 'react';
import '../styles/App.css';
import { Route, Routes } from 'react-router-dom';
import Headers from '../components/Headers';
import Nav from '../components/Nav';
import Canvas from '../components/Canvas'

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
	  <Canvas/>
    </div>
  );
}

export default App;
