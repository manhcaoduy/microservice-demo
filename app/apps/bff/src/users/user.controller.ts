import { CurrentUserId } from '@libs/common/auth/auth.decorator';
import { AuthGuard } from '@libs/common/auth/auth.guard';
import { Public } from '@libs/common/auth/public.decorator';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';
import { CreateUserResponse } from './responses/create-user.response';
import { GetMyUserInfoResponse } from './responses/get-my-user-info.response';
import { LoginResponse } from './responses/login.response';
import { UpdateUserByIdResponse } from './responses/update-user-by-id.response';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    const accessToken = await this.userService.create(createUserDto);
    return new CreateUserResponse({ accessToken });
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
    const accessToken = await this.userService.login(loginUserDto);
    return new LoginResponse({ accessToken });
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
  @UseGuards(AuthGuard)
  async getMyUserInfo(
    @CurrentUserId() userId: number,
  ): Promise<GetMyUserInfoResponse> {
    const user = await this.userService.findById(userId);
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
  @UseGuards(AuthGuard)
  async updateUserById(
    @CurrentUserId() id: number,
    @Body() updateUserDto: UpdateUserByIdDto,
  ): Promise<UpdateUserByIdResponse> {
    const user = await this.userService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UpdateUserByIdResponse(user);
  }
}
