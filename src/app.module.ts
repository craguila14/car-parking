import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SpotsModule } from './spots/spots.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ssl: true,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    CommonModule,
    ReservationsModule,
    SpotsModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
