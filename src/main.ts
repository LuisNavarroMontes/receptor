import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppGateway } from './tcp/appGateway';
import * as net from 'net';
import { appendFile } from 'fs';

const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
 
  // Crear el servidor TCP
  const tcpServer = net.createServer((socket) => {
     socket.on('data', (data) => {
       console.log(`Datos recibidos: ${data.toString()}`);
       const appGateway = app.get(AppGateway);
       appGateway.sendMessageToClients(data.toString());
     });
  });
  tcpServer.listen(this.env.PORT, () => console.log('Servidor TCP escuchando en el puerto 3000'));
 
  // Crear la aplicación Express
  const server = http.createServer(app);
 
  // Configurar CORS para Socket.IO
  const io = socketIo(server, {
     cors: {
       origin: "*",
       methods: ["*"],
     }
  });
 
  // Iniciar el servidor
  const PORT = 4000;
  server.listen(PORT, () => {
     console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
 
  // Manejar conexiones de Socket.IO
  io.on('connection', (socket) => {
     console.log('Usuario conectado');
 
     socket.on('message', (data) => {
       console.log('Mensaje recibido:', data);
       io.emit('message', 'Hola desde el servidor');
     });
 
     socket.on('disconnect', () => {
       console.log('Usuario desconectado');
     });
 
     // Inyectar el servidor WebSocket en el AppGateway
     const appGateway = app.get(AppGateway);
     appGateway.server = io;
  });
 }
 
 bootstrap();