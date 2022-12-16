import { Link } from "react-router-dom";
import './Nav.css';

const Nav = () => {
    return (
        <div className="Nav">
          <Link className="Nav-Link" to='/user'>User</Link>
          <Link className="Nav-Link" to='/history'>History</Link>
          <Link className="Nav-Link" to='/friends'>Friends</Link>
        </div>
    )
}

export default Nav;