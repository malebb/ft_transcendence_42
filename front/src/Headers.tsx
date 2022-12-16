import './Headers.css';
import { Link } from 'react-router-dom';

const Headers = () => {
    return(
        <div className="Headers">
            <Link className='Header-Link' to='/'>Transcendance</Link>
        </div>
    )
}

export default Headers;