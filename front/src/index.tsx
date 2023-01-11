import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import Main from './components/Main';
import Signin from './components/Login/signin';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import PrivateRoutes from './components/PrivateRoute/PrivateRoutes';
import Signup from './components/Login/signup';
import { AuthProvider } from './context/TokenContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
