import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Headers from './Headers';
import Nav from './Nav';
import Main from './Main';
import PrivateRoutes from './PrivateRoute/PrivateRoutes';
import AuthContext, { AuthProvider } from './context/TokenContext';
import Signup from './Login/signup';
import Signin from './Login/signin';
import Friends from './Friends';
import History from './History';
import User from './User';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateRoutes /> } >
            <Route path='/user' element={<User/>} />
            <Route path='/history' element={<History/>}/>
            <Route path='/friends'element={<Friends/>}/>
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
