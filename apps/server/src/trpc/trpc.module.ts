import { Module } from '@nestjs/common';
import { TrpcRouter } from '@server/trpc/trpc.router';

@Module({
  imports: [],
  providers: [TrpcRouter],
})
export class TrpcModule {}
