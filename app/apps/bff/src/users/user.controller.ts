import { CurrentUserId } from '@libs/common/auth/auth.decorator';
import { Public } from '@libs/common/auth/public.decorator';
import { UserServiceClient } from '@libs/common/grpc/node/user/user.pb';
import { USER_SERVICE } from '@libs/common/grpc/options/user-grpc-option';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';
import { CreateUserResponse } from './responses/create-user.response';
import { GetMyUserInfoResponse } from './responses/get-my-user-info.response';
import { LoginResponse } from './responses/login.response';
import { UpdateUserByIdResponse } from './responses/update-user-by-id.response';

@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly userServiceClient: UserServiceClient,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns the registered user',
    type: CreateUserResponse,
  })
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponse> {
    const { accessToken, refreshToken } = await lastValueFrom(
      this.userServiceClient.register(createUserDto),
    );
    return new CreateUserResponse({ accessToken, refreshToken });
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access token on successful login',
    type: LoginResponse,
  })
  async loginUser(@Body() loginUserDto: LoginDto): Promise<LoginResponse> {
    const { accessToken, refreshToken } = await lastValueFrom(
      this.userServiceClient.login(loginUserDto),
    );
    return new LoginResponse({ accessToken, refreshToken });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user info',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user information',
    type: GetMyUserInfoResponse,
  })
  async getMyUserInfo(
    @CurrentUserId() userId: string,
  ): Promise<GetMyUserInfoResponse> {
    const { user } = await lastValueFrom(
      this.userServiceClient.getUserById({ userId }),
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new GetMyUserInfoResponse({ user });
  }

  @Put('update')
  @ApiOperation({
    summary: 'Update User',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated user',
    type: UpdateUserByIdResponse,
  })
  async updateUserById(
    @CurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserByIdDto,
  ): Promise<UpdateUserByIdResponse> {
    const { user } = await lastValueFrom(
      this.userServiceClient.updateUser({ userId, userData: updateUserDto }),
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UpdateUserByIdResponse({ user });
  }
}
