import "../styles/Headers.css";
import { Link } from "react-router-dom";

const HeadersTitle = () => {
  return (
    <div className="HeadersTitle">
      <Link className="Header-Link" to="/">
        <h1 className="Header-Title">Transcendence</h1>
      </Link>
    </div>
  );
};

export default HeadersTitle;
