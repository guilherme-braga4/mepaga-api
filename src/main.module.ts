import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExampleModule } from './modules/example/example.module';
import { AppInterceptor } from './exceptions/global.exception';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env.prod'],
      isGlobal: true,
    }),
    ExampleModule,
    UsersModule,
    AuthModule
  ],
  providers: [ConfigService, {
    provide: APP_INTERCEPTOR,
    useClass: AppInterceptor
  }],
  exports: [ConfigService],
})
export class MainModule { }
