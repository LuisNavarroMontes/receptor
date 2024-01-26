import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { AppGateway } from './app.gateway';

async function bootstrap() {
 const app = express();
 const httpServer = createServer(app);

 // Create a new instance of the AppGateway
 const appGateway = new AppGateway();

 // Configure CORS for Socket.IO
 const io = new Server(httpServer, {cors: {origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']}});

 // Handle Socket.IO connections
 io.on('connection', (socket) => {
     console.log('User connected');
     appGateway.server = io;
     socket.on('message', (data) => {
       console.log('Received message:', data);
       appGateway.sendMessageToClients(data.toString());
     });

     socket.on('disconnect', () => {
       console.log('User disconnected');
     });
 });

 const port = process.env.PORT || 3000;
 await httpServer.listen(port);
 console.log(`Server is running at http://localhost:${port}`);
}

bootstrap();