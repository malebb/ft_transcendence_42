import { Link } from "react-router-dom";
import '../styles/Headers.css';
import SearchBar from "./SearchBar";

const Nav = () => {
    return (
        <div className="Nav">
          <SearchBar/>
        </div>
    )
}

export default Nav;
