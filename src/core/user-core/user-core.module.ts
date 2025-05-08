import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { UserCoreService } from './user-core.service';

@Module({
  providers: [PrismaService, UserCoreService],
  exports: [UserCoreService],
})
export class UserCoreModule {}
