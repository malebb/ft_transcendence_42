import jwt_decode from "jwt-decode";
import { Socket } from "socket.io";
import { WsException } from '@nestjs/websockets';

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
