import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

async function bootstrap() {
    const app = express();
    const httpServer = createServer(app);
    await httpServer.listen(process.env.PORT || 3000);
    console.log('Socket.IO server listening on port', process.env.PORT || 3000);

    let json = {
        "N_con": 0,
    };

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected to the socket');

        socket.on('data', (data) => {
          const newDevices = Object.keys(data).filter(key => key.startsWith('IoT'));
          newDevices.forEach(deviceKey => {
              const deviceData = data[deviceKey];
              let existingDevice = json[deviceKey];
              if (existingDevice) {
                  // Si el dispositivo ya existe, agregamos la temperatura al array existente
                  existingDevice.temperatura.push(deviceData.temperatura);
              } else {
                  // Si el dispositivo no existe, lo agregamos al JSON
                  json[deviceKey] = {
                      ...deviceData,
                      "temperatura": [deviceData.temperatura]
                  };
              }
          });
      
          // Actualizamos la cantidad de dispositivos IoT
          json.N_con = Object.keys(json).filter(key => key.startsWith('IoT')).length;
          console.log('Modified JSON:', json);
          socket.broadcast.emit('message', json);
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