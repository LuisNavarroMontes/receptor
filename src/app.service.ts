import { Injectable } from '@nestjs/common';
import { get } from 'http';
import { getTemeperaturas } from './main';

@Injectable()
export class AppService {
  getDatos(): any {
    return getTemeperaturas();
  }
}
