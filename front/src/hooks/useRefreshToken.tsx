import { axiosMain } from 'src/api/axios';
import { SignInterface } from 'src/interfaces/Sign';
import useAuth from './useAuth';
import { useNavigate } from 'react-router-dom';

const useRefreshToken = () => {
    const navigate = useNavigate();
    const context = useAuth();

    const refresh = async () => {
        try{
        const response = await axiosMain.post<SignInterface>('/auth/refresh');
        context.setToken(response.data.tokens);
        context.setUserId(response.data.userId);
        context.setUsername(response.data.username);
        return response.data.tokens.access_token;
        }
        catch(err: any)
        {
            if (err.response?.status === 401) {
            context.setToken(undefined);
            context.setUserId(undefined);
            context.setUsername(undefined);
            navigate("/")
            }
        }
    }
    return refresh;
};

export default useRefreshToken;
