import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { AppGateway } from './appGateway';

@Injectable()
export class TcpServerService {
  private server: net.Server;

  constructor(private readonly appGateway: AppGateway) {
    this.server = net.createServer(this.handleConnection.bind(this));
    this.server.listen(4000, 'receptor-nsaocnoix-luis-projects-b8acb995.vercel.app');
  }

  private handleConnection(socket: net.Socket): void {
    // Manejar la lógica cuando se recibe data del cliente TCP
    socket.on('data', (data) => {
        console.log(`Datos recibidos: ${data.toString()}`);
      // Enviar los datos a los clientes WebSocket conectados
      // Puedes almacenar los clientes WebSocket y enviarles mensajes cuando sea necesario
      this.appGateway.sendMessageToClients(data.toString());
    });
  }
}