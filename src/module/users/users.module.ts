import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/shared/modules/prisma/prisma.module';
import { UserCoreModule } from 'src/core/user-core/user-core.module';

@Module({
  imports: [
    PrismaModule,
    UserCoreModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
