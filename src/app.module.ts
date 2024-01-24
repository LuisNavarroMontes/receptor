import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TcpServerService } from './tcp/tcpServer.service';
import { AppGateway } from './tcp/appGateway';

@Module({
  imports: [
    
  ],
  controllers: [AppController],
  providers: [AppService, TcpServerService, AppGateway],
})
export class AppModule {}
