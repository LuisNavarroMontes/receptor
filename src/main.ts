import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppGateway } from './tcp/appGateway';
import * as net from 'net';
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

async function bootstrap() {
  const app = express();
  await app.listen(process.env.PORT || 3000);
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
  
  
const httpServer = createServer(app);
  
  // Configurar CORS para Socket.IO
  const io = new Server(httpServer, {
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
  });
 }
 
 bootstrap();