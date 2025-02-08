import { User } from '@libs/postgres/entities/user.entity';
import { UserResponse } from './user.response';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UpdateUserByIdResponse {
  @Expose()
  @ApiProperty({
    type: UserResponse,
  })
  @Type(() => UserResponse)
  user: UserResponse;

  constructor(user: User) {
    this.user = new UserResponse(user);
  }
}
