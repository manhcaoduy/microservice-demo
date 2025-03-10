import { AuthService } from '@libs/common/auth/auth.service';
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
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
    private socketEmitter: SocketEmitter,
  ) {}

  async findById(id: number): Promise<User | null> {
    this.socketEmitter.emitEventToAllClients('get-user', {
      id,
    });

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
