import { User } from '@libs/postgres/entities/user.entity';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
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
