import { User } from '@libs/postgres/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponse } from '../../../../../libs/common/src/responses/user.response';

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
