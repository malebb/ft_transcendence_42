import React from 'react';
import '../styles/App.css';
import { Route, Routes } from 'react-router-dom';
import Headers from '../components/Headers';
import Nav from '../components/Nav';
import Canvas from '../components/Canvas'

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
      <Canvas/>
    </BrowserRouter>
  </AuthProvider> 
  );
}

export default App;
