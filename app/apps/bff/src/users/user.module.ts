import { AuthModule } from '@libs/common/auth/auth.module';
import { User } from '@libs/postgres/entities/user.entity';
import { SocketEmitter } from '@libs/socket/emitter/emitter';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [UserService, SocketEmitter],
})
export class UserModule {}
