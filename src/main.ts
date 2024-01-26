import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppGateway } from './tcp/appGateway';
import * as net from 'net';

const http = require('http');
const socketIo = require('socket.io');

async function bootstrap() {
  const PUERTO = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PUERTO, "0.0.0.0");
  const appGateway = app.get(AppGateway);
  /*
  // Crear el servidor TCP
  const tcpServer = net.createServer((socket) => {
     socket.on('data', (data) => {
       console.log(`Datos recibidos: ${data.toString()}`);
       appGateway.sendMessageToClients(data.toString());
     });
  });
  tcpServer.listen(PUERTO, () => console.log('Servidor TCP escuchando en el puerto 3000'));
 */
  // Crear la aplicación Express
  
  const server = http.createServer(app);
  
  // Configurar CORS para Socket.IO
  const io = socketIo(server, {
     cors: {
       origin: "*",
       methods: ["*"],
     }
  });
 
  // Manejar conexiones de Socket.IO
  io.on('connection', (socket) => {
     console.log('Usuario conectado');
     const appGateway = app.get(AppGateway);
     appGateway.server = io;
     socket.on('message', (data) => {
       console.log('Mensaje recibido:', data);
       appGateway.sendMessageToClients(data.toString());
     });
 
     socket.on('disconnect', () => {
       console.log('Usuario desconectado');
     });
 
     // Inyectar el servidor WebSocket en el AppGateway
  });
 }
 
 bootstrap();