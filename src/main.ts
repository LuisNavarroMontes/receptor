import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { AppGateway } from './app.gateway';

async function bootstrap() {
 const app = express();
 const httpServer = createServer(app);
 await httpServer.listen(process.env.PORT || 3000);
 // Create a new instance of the AppGateway
 const appGateway = new AppGateway();

 // Configure CORS for Socket.IO
 const io = new Server(httpServer, {
     cors: {
       origin: "*",
       methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
     }
 });

 // Handle Socket.IO connections
 io.on('connection', (socket) => {
     console.log('User connected to the socket');
     appGateway.server = io;
     socket.on('message', (data) => {
       console.log('Received message:', data);
       appGateway.sendMessageToClients(data.toString());
     });

     socket.on('disconnect', () => {
       console.log('User disconnected');
     });
 });
}

bootstrap();