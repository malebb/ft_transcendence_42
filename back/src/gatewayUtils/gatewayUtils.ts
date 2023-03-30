import jwt_decode from "jwt-decode";
import { Socket } from "socket.io";
import { verify }  from 'jsonwebtoken';
import { WsException } from '@nestjs/websockets';
import { UserService } from '../user/user.service';

type JwtDecoded = 
{
	sub: number
}

export const getIdFromToken = (token: string) =>
{
	const jwtDecoded: JwtDecoded = jwt_decode(token);
	const id: number = jwtDecoded.sub;
	return (id);
}

export const isAuthEmpty = (client: Socket) =>
{
	if (!Object.keys(client.handshake.auth).length)
		client.emit('error', new WsException('Invalid credentials'));
	else if (client.handshake.auth.token === undefined)
		client.emit('error', new WsException('Invalid credentials'));
	else
		return (false);
	return (true);
}

export const getIdIfValid = async (client: Socket, secret: string, userService: UserService) =>
{
	if (isAuthEmpty(client))
		return (0);
	try
	{
		verify(client.handshake.auth.token, secret);
		const id = getIdFromToken(client.handshake.auth.token);
		const user = await userService.getUserProfile(id);
		if (user)
			return (id)
	}
	catch (error: any)
	{
		client.emit('error', new WsException('Invalid credentials'));
	}
	return (0);
}
