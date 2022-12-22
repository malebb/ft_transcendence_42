import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		MessageBody}
from '@nestjs/websockets';

import { Socket, Server} from "socket.io"

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:3333',
	}
})
export class GatewayPong {

	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket)
	{
		console.log("New client ! id = " + client.id);
	}

	handleDisConnect(client: Socket)
	{
		console.log("client left ! id = " + client.id);
	}
	
	@SubscribeMessage('ball')
	handleBall(@MessageBody() data : any) {
		this.server.emit('ball', JSON.stringify(data));
    }

	@SubscribeMessage('playerA')
	handlePlayerA(@MessageBody() data : any) {
		this.server.emit('playerA', JSON.stringify(data));
  	}

	@SubscribeMessage('playerB')
	handlePlayerB(@MessageBody() data : any) {
		this.server.emit('playerB', JSON.stringify(data));
  	}
}
