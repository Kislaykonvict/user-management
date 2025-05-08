import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module'; 
import { UsersModule } from './module/users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from 'config/configuration';
import { PrismaService } from './shared/modules/prisma/prisma.service';
import { IngestionModule } from './module/ingestion/ingestion.module';
import { DocumentsModule } from './module/documents/documents.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      cache: true,
      isGlobal: true,
    }),
    HttpModule,
    AuthModule,
    UsersModule,
    IngestionModule,
    DocumentsModule,
  ],
  providers: [PrismaService]
})
export class AppModule {}