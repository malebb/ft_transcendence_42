import React, { useContext } from "react";
import Nav from "./Nav";
import Log from "./Log";
import HeadersTitle from "./HeadersTitle";
import "../styles/Headers.css";
import AuthContext from "src/context/TokenContext";

const Headers = () => {
  const context =  useContext(AuthContext)
  return (
    <div className="static_header">
      <HeadersTitle />
      {context.token ? <Nav /> : <Log />}
    </div>
  );
};

export default Headers
