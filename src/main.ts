import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppGateway } from './tcp/appGateway';
import { appendFile } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Permitir cualquier origen, deberías restringir esto en producción
  app.listen(3000); // Iniciar el servidor HTTP en el puerto 3000
  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');

  // Crear la aplicación Express
  const server = http.createServer(app);

  // Configurar CORS para Socket.IO
  const io = socketIo(server, {
    cors: {
      origin: '*',
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