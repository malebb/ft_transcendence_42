import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const context = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        function doesHttpOnlyCookieExist(cookiename: string) {
            var d = new Date();
            d.setTime(d.getTime() + (1000));
            var expires = "expires=" + d.toUTCString();
          
            document.cookie = cookiename + "=new_value;path=/;" + expires;
            return document.cookie.indexOf(cookiename + '=') === -1;
        }
        
        if (!doesHttpOnlyCookieExist('rt_token'))
        {
            context.setToken(undefined);
            context.setUserId(undefined);
            context.setUsername(undefined);
            navigate("/")
        }}, [context, navigate]);
    useEffect(() => {
        // function doesHttpOnlyCookieExist(cookiename: string) {
        //     var d = new Date();
        //     d.setTime(d.getTime() + (1000));
        //     var expires = "expires=" + d.toUTCString();
          
        //     document.cookie = cookiename + "=new_value;path=/;" + expires;
        //     return document.cookie.indexOf(cookiename + '=') === -1;
        // }
        
        // if (!doesHttpOnlyCookieExist('rt_token'))
        // {
        //     context.setToken(undefined);
        //     context.setUserId(undefined);
        //     context.setUsername(undefined);
        //     navigate("/")
        // }

        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${context.token?.access_token}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [context.token, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;
