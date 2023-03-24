import axios from 'axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setToken} = useAuth();

    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });
        setToken(response.data);
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;