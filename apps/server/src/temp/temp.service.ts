import { Injectable } from '@nestjs/common';

@Injectable()
export class TempService {
  temp(): string {
    return 'TEMP!!!!!!!';
  }
}
