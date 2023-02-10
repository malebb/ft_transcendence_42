import { Link } from "react-router-dom";
import '../styles/Nav.css';

const Nav = () => {
    return (
        <div className="Nav">
          <Link className="Nav-Link" to='/games'>Games</Link>
          <Link className="Nav-Link" to='/user'>User</Link>
          <Link className="Nav-Link" to='/history'>History</Link>
          <Link className="Nav-Link" to='/friends'>Friends</Link>
        </div>
    )
}

export default Nav;
