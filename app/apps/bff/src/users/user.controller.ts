import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { CreateUserDto } from './dtos/create-user.dto';
import type { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';
import { GetUserByIdResponse } from './responses/get-user-by-id.response';
import { GetUsersResponse } from './responses/get-users.response';
import { UpdateUserByIdResponse } from './responses/update-user-by-id.response';
import type { UserService } from './user.service';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Users',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of users',
    type: GetUsersResponse,
  })
  async getUsers(): Promise<GetUsersResponse> {
    const users = await this.userService.findAll();
    return new GetUsersResponse({ users });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get User by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a single user',
    type: GetUserByIdResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: number): Promise<GetUserByIdResponse> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new GetUserByIdResponse(user);
  }

  @Post()
  @ApiOperation({
    summary: 'Create User',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns the created user',
    type: GetUserByIdResponse,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<GetUserByIdResponse> {
    const user = await this.userService.create(createUserDto);
    return new GetUserByIdResponse(user);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update User',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated user',
    type: UpdateUserByIdResponse,
  })
  async updateUserById(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserByIdDto,
  ): Promise<UpdateUserByIdResponse> {
    const user = await this.userService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UpdateUserByIdResponse(user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove User',
  })
  @ApiResponse({
    status: 204,
    description: 'User successfully removed',
  })
  async removeUserById(@Param('id') id: number): Promise<void> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userService.remove(id);
  }
}
