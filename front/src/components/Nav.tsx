import { Link } from "react-router-dom";
import '../styles/Headers.css';
import SearchBar from "./SearchBar";

const Nav = () => {
    return (
        <div className="Nav">
          <Link className="Nav-Link" to='/user'>User</Link>
          <Link className="Nav-Link" to='/history'>History</Link>
          <Link className="Nav-Link" to='/friends'>Friends</Link>
          <Link className="Nav-Link" to='/chat'>Chat</Link>
          <SearchBar/>
        </div>
    )
}

export default Nav;
