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
import SetTfa from './SetTfa';
import DeleteTfa from './DeleteTfa';
import VerifTfa from './VerifTfa';
import User from './User';
import History from './History';
import Friends from './Friends';
import Chat from './chatSOCKET/chat';
import Rooms from './chatSOCKET/containers/Rooms'
import PrivateRoutes from './PrivateRoute/PrivateRoutes';
import {useEffect} from 'react';

        /*<Route element={<PrivateRoutes /> } ></Route>
        </Route>*/
function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
          <Route path='/user' element={<User/>} />
          <Route path='/history' element={<History/>}/>
          <Route path='/friends'element={<Friends/>}/>
		  <Route path='/chat' element={<Chat/>}/>
          <Route path='/chat/:roomId' element={<Chat/>}/>
        <Route path='/' element={<Main/>} />
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/2factivate' element={<SetTfa/>}/>
        <Route path='/2fadelete' element={<DeleteTfa/>}/>
        <Route path='/2faverif' element={<VerifTfa/>}/>
      </Routes>
    </BrowserRouter>
  </AuthProvider> 
  );
}

export default App;
