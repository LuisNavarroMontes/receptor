import { Get } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

interface Device {
  id: number;
  nombre: string;
  estado: string;
  temperatura: number[];
}

interface JSONData {
  N_con: number;
  [key: string]: Device | number;
}

let json: JSONData = {
    "N_con": 0,
  };

export function getTemeperaturas() {
    return json;
}


async function bootstrap() {
    const app = express();
    app.get('/', (req, res) => {
        res.send(json);
    });
    const httpServer = createServer(app);
    await httpServer.listen(process.env.PORT || 3000);
    console.log('Socket.IO server listening on port', process.env.PORT || 3000);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected to the socket');
        socket.broadcast.emit('conexion', json);
        let nextIoTNumber = 1;
        socket.on('data', (data) => {
            const newDevices = Object.keys(data).filter(key => key.startsWith('IoT'));
            newDevices.forEach(deviceKey => {
                const deviceData = data[deviceKey];
                let existingDevice = Object.values(json).find(device => {
                    return typeof device !== 'number' && device.id === deviceData.id;
                });
                if (existingDevice) {
                    if (typeof existingDevice !== 'number') {
                        // Si el dispositivo ya existe, agregamos la temperatura al array existente
                        existingDevice.temperatura.push(deviceData.temperatura);
                    }
                } else {
                    // Si el dispositivo no existe, lo agregamos al JSON
                    const newDeviceKey = `IoTN_${nextIoTNumber++}`;
                    json[newDeviceKey] = {
                        ...deviceData,
                        "id": deviceData.id,
                        "temperatura": [deviceData.temperatura]
                    };
                }
            });

            // Actualizamos la cantidad de dispositivos IoT
            json.N_con = Object.keys(json).filter(key => key.startsWith('IoTN')).length;
            console.log('Modified JSON:', json);
            socket.broadcast.emit('message', json);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}

bootstrap();