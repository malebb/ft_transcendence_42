import axios from "axios";

const baseURL = 'http://localhost:3333'

export const axiosMain =  axios.create({
    baseURL,
})

export function getToken()
{
    return JSON.parse(sessionStorage.getItem('tokens')!);
}

export function getAuthorizationHeader()
{
	if (!getToken())
		return (null);
	return (`Bearer ${getToken().access_token}`);
}

export function axiosToken()
{
	return (axios.create({
		baseURL,
		headers: { Authorization: getAuthorizationHeader() },
		}));
}
