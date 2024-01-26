import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
 @WebSocketServer()
 server: Server;

 sendMessageToClients(message: string): void {
    this.server.emit('message', message);
 }
}