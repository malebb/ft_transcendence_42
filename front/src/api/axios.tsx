import axios from "axios";

const baseURL = 'http://localhost:3333'

export const axiosMain =  axios.create({
    baseURL,
})

export const getToken = () => {
    return JSON.parse(sessionStorage.getItem('token')!);
}

export const getAuthorizationHeader = () => `Bearer ${getToken()}`;

export const axiosToken = axios.create({
  baseURL,
  headers: { Authorization: getAuthorizationHeader() },
});