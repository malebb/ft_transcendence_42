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
export function getRefreshHeader()
{
	if (!getToken())
		return (null);
		console.log(getToken().refresh_token);
	return (`Bearer ${getToken().refresh_token}`);
}

export async function axiosToken() 
{
	const date = new Date();
	const token = JSON.parse(sessionStorage.getItem('tokens')!);
	const time = token['expireIn'];
	const crea_time = new Date(token['crea_time']);
	console.log(time);
	//if (date.getTime() >= crea_time.getTime() + (time - 10) * 1000)
	//{
		console.log("expire");
		const new_jwt = await axiosMain.post('/auth/refresh',
		{
			headers: {
				'Authorization' : getRefreshHeader(),
			},
		});
		console.log(new_jwt.data);
		//
	//}
	//const diff  = time.getTime() - date.getTime();
	//console.log(diff);

	return (axios.create({
		baseURL,
		headers: { Authorization: getAuthorizationHeader() },
		}));
}
