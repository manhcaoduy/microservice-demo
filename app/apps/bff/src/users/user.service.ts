import {
  MemoryCacheService,
  RedisCacheService,
} from '@libs/caching/caching-client.service';
import { AuthService } from '@libs/common/auth/auth.service';
import { AppLogger } from '@libs/common/logger/app-logger';
import { User } from '@libs/postgres/entities/user.entity';
import { SocketEmitter } from '@libs/socket/emitter/emitter';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';

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

  async findById(id: number): Promise<User | null> {
    this.testEmitEvent();
    await this.testRedis();

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(user: CreateUserDto): Promise<string> {
    const { username, password, firstName, lastName } = user;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const passwordHash = this.authService.generatePasswordHash(password);

    const newUser = this.userRepository.create({
      username,
      passwordHash,
      firstName,
      lastName,
    });

    await this.userRepository.save(newUser);

    const accessToken = await this.authService.generateAccessToken(newUser);

    return accessToken;
  }

  async login(data: LoginDto): Promise<string> {
    const { username, password } = data;

    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = this.authService.generatePasswordHash(password);

    if (user.passwordHash !== passwordHash) {
      throw new BadRequestException('Wrong password');
    }

    const accessToken = await this.authService.generateAccessToken(user);

    return accessToken;
  }

  async update(id: number, user: UpdateUserByIdDto): Promise<User | null> {
    const { password, firstName, lastName, isActive } = user;

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
