import { Module } from '@nestjs/common';
import { TempService } from './temp.service';

@Module({
  imports: [],
  providers: [TempService],
  exports: [TempService],
})
export class TempModule {}
