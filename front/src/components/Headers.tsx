import '../styles/Headers.css';
import { Link } from 'react-router-dom';

const Headers = () => {
    return(
        <div className="Headers">
            <Link className='Header-Link' to='/'>Transcendence</Link>
        </div>
    )
}

export default Headers;
