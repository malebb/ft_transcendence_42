import React, { useContext } from "react";
import Nav from "./Nav";
import Log from "./Log";
import HeadersTitle from "./HeadersTitle";
import "../styles/Headers.css";
import AuthContext from "src/context/TokenContext";

const Headers = () => {
  const context =  useContext(AuthContext);
  // const [nav, setNav] = useState<boolean>(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {}, 5000);
  //   // setIsLoading(false);
  //   if (context.token)
  //     setNav(true)
  //   return () => clearTimeout(timer);
  //  }, [])


  return (
    <div className="static_header">
      <HeadersTitle />
      {context.token ? <Nav /> : <Log />}
    </div>
  );
};

export default Headers
