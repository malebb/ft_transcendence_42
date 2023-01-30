import React from 'react';
import '../styles/App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Headers from '../components/Headers';
import Nav from '../components/Nav';
import Canvas from '../components/Canvas'
import { AuthProvider } from '../context/TokenContext';
import Main from './Main';
import Signin from './Login/signin';
import Signup from './Login/signup';
import User from './User';
import History from './History';
import Friends from './Friends';
import PrivateRoutes from './PrivateRoute/PrivateRoutes';
import {useEffect} from 'react';
import Chat from './Chat/chat';

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoutes /> } >
          <Route path='/user' element={<User/>} />
          <Route path='/history' element={<History/>}/>
          <Route path='/friends'element={<Friends/>}/>
		  <Route path='/chat' element={<Chat/>}/>
        </Route>
        <Route path='/' element={<Main/>} />
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  </AuthProvider> 
  );
}

export default App;
