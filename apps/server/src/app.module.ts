import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TrpcModule } from '@server/trpc/trpc.module';
import { TempModule } from './temp/temp.module';

@Module({
  imports: [ConfigModule.forRoot(), TrpcModule, TempModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
