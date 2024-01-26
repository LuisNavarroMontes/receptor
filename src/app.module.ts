import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './tcp/appGateway';

@Module({
  imports: [
    
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
