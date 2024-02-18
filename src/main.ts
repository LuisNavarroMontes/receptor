import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors'; // Import cors package
import * as bodyParser from 'body-parser';

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

    // Enable CORS
    app.use(cors());
    app.use(bodyParser.json());
    app.get('/', (req, res) => {
        res.send(json);
    });


    let nextIoTNumber = 1;
    app.post("/", (req, res)=>{
        res.send('POST request to the homepage');
        let data = req.body
        console.log('Data:', data);
        const newDeviceKey = `IoTN_${nextIoTNumber++}`;
            json[newDeviceKey] = {
                ...data,
                "id": data.data.id,
                "lat": data["data"]["lat"],
                "lon": data["data"]["lon"],
                "name": data["data"]["name"],
                "status": data["data"]["status"],
                "temp": data["data"]["temp"]
            };
            json.N_con = Object.keys(json).filter(key => key.startsWith('IoTN')).length;
            console.log('Modified JSON:', json);
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