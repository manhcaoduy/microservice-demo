import type { User } from '@libs/postgres/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { UserResponse } from './user.response';

export class GetUserByIdResponse {
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
