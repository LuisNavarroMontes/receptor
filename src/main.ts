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
 console.log('Socket.IO server listening on port', process.env.PORT || 3000);
 // Create a new instance of the AppGateway
 const appGateway = new AppGateway();
 let json = {
   "N_con": 0,
 }
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
     socket.on('data', (data) => {
       // Aquí modificamos el JSON recibido y agregamos nuevos dispositivos IoT
       const newDevices = Object.keys(data).filter(key => key.startsWith('IoT'));
       newDevices.forEach(deviceKey => {
         const deviceData = data[deviceKey];
         const existingDevice = json[deviceKey];
         if (existingDevice && typeof existingDevice === 'object' && 'id' in existingDevice) {
           // Si el dispositivo ya existe y es un objeto con la propiedad 'id', agregamos la temperatura al array existente
           existingDevice.temperatura.push(deviceData.temperatura);
         } else {
           // Si el dispositivo no existe o no tiene la propiedad 'id', lo agregamos al JSON
           const newId = Object.keys(json).filter(key => key.startsWith('IoT')).length + 1;
           json[deviceKey] = {
             ...deviceData,
             "id": newId,
             "temperatura": [deviceData.temperatura]
           };
         }
       });
       // Actualizamos la cantidad de dispositivos IoT
       json.N_con = Object.keys(json).filter(key => key.startsWith('IoT')).length;
       console.log('Modified JSON:', json);
       socket.broadcast.emit('message', json);
     });

     socket.on('disconnect', () => {
       console.log('User disconnected');
     });
 });
}

bootstrap();