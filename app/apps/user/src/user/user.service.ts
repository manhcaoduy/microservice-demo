import {
  MemoryCacheService,
  RedisCacheService,
} from '@libs/caching/caching-client.service';
import { AuthService } from '@libs/common/auth/auth.service';
import {
  LoginRequest,
  RegisterRequest,
  UpdateUserData,
} from '@libs/common/grpc/node/user/user.pb';
import { AppLogger } from '@libs/common/logger/app-logger';
import { User } from '@libs/postgres/entities/user.entity';
import { SocketEmitter } from '@libs/socket/emitter/emitter';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserNotFoundException,
  UsernameAlreadyExistsException,
  WrongPasswordException,
} from './user.exception';

@Injectable()
export class UserService {
  private readonly logger = new AppLogger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
    private socketEmitter: SocketEmitter,
    private redisCacheService: RedisCacheService,
    private memoryCacheService: MemoryCacheService,
  ) {}

  private testEmitEvent() {
    this.socketEmitter.emitEventToAllClients('get-user', {
      id: 1,
    });
  }

  private async testRedis() {
    await this.redisCacheService.set('abc', { a: 1, b: 2 });
    await this.memoryCacheService.set('ghk', { c: 3, d: 4 });

    const a = await this.redisCacheService.get('abc');
    const b = await this.redisCacheService.get('ghk');
    const c = await this.memoryCacheService.get('abc');
    const d = await this.memoryCacheService.get('ghk');

    this.logger.info('test redis', {
      a,
      b,
      c,
      d,
      e: typeof a,
      f: typeof b,
      g: typeof c,
      h: typeof d,
    });
  }

  async findById(id: string): Promise<User | null> {
    this.testEmitEvent();
    await this.testRedis();

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new UserNotFoundException('User not found');
    }

    return user;
  }

  async validateAccessToken(accessToken: string): Promise<string> {
    return this.authService.validateToken(accessToken);
  }

  async generateNewAccessToken(refreshToken: string): Promise<string> {
    const userId = await this.authService.validateToken(refreshToken);
    return this.authService.generateAccessToken(userId);
  }

  async create(
    user: RegisterRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password, firstName, lastName } = user;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new UsernameAlreadyExistsException('Username already exists');
    }

    const passwordHash = this.authService.generatePasswordHash(password);

    const newUser = this.userRepository.create({
      username,
      passwordHash,
      firstName,
      lastName,
    });

    await this.userRepository.save(newUser);

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.generateAccessToken(newUser.id),
      this.authService.generateRefreshToken(newUser.id),
    ]);

    return { accessToken, refreshToken };
  }

  async login(
    data: LoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password } = data;

    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = this.authService.generatePasswordHash(password);

    if (user.passwordHash !== passwordHash) {
      throw new WrongPasswordException('Wrong password');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.generateAccessToken(user.id),
      this.authService.generateRefreshToken(user.id),
    ]);

    return { accessToken, refreshToken };
  }

  async update(id: string, user?: UpdateUserData): Promise<User | null> {
    const password = user?.password;
    const firstName = user?.firstName;
    const lastName = user?.lastName;
    const isActive = user?.isActive;

    const passwordHash = password
      ? this.authService.generatePasswordHash(password)
      : undefined;

    await this.userRepository.update(id, {
      passwordHash,
      firstName,
      lastName,
      isActive,
    });

    return this.findById(id);
  }
}
