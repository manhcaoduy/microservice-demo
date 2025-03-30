import {
  GenerateNewAccessTokenRequest,
  GenerateNewAccessTokenResponse,
  GetUserByIdResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UserServiceController,
  UserServiceControllerMethods,
  ValidateAccessTokenRequest,
  ValidateAccessTokenResponse,
} from '@libs/common/grpc/node/user/user.pb';
import { GetUserByIdRequest } from '@libs/common/grpc/node/user/user.pb';
import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.userService.create(request);
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(request);
  }

  async validateAccessToken(
    request: ValidateAccessTokenRequest,
  ): Promise<ValidateAccessTokenResponse> {
    const userId = await this.userService.validateAccessToken(
      request.accessToken,
    );
    return {
      userId,
    };
  }

  async generateNewAccessToken(
    request: GenerateNewAccessTokenRequest,
  ): Promise<GenerateNewAccessTokenResponse> {
    const accessToken = await this.userService.generateNewAccessToken(
      request.refreshToken,
    );
    return {
      accessToken,
    };
  }

  async getUserById(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const user = await this.userService.findById(request.userId);
    return {
      user: user ?? undefined,
    };
  }

  async updateUser(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const user = await this.userService.update(
      request.userId,
      request.userData,
    );
    return {
      user: user ?? undefined,
    };
  }
}
