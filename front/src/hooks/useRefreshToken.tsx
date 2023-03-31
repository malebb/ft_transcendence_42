import { axiosMain } from 'src/api/axios';
import { SignInterface } from 'src/interfaces/Sign';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const context = useAuth();

    const refresh = async () => {
        const response = await axiosMain.post<SignInterface>('/auth/refresh');
        context.setToken(response.data.tokens);
        context.setUserId(response.data.userId);
        context.setUsername(response.data.username);
        return response.data.tokens.access_token;
    }
    return refresh;
};

export default useRefreshToken;
