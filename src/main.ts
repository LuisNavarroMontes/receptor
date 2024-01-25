import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppGateway } from './tcp/appGateway';
import { appendFile } from 'fs';

const cors = require('cors');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.listen(3000);
  app.enableCors();
  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');

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
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Servidor Socket.IO escuchando en el puerto ${PORT}`);
  });

  const appGateway = app.get(AppGateway);

  
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
    appGateway.server = io;
  });
}

bootstrap();