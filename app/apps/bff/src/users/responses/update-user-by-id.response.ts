import { UserResponse } from '@libs/common/responses/user.response';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UpdateUserByIdResponse {
  @Expose()
  @ApiProperty({
    type: UserResponse,
  })
  @Type(() => UserResponse)
  user: UserResponse;

  constructor(data: UpdateUserByIdResponse) {
    this.user = new UserResponse(data.user);
  }
}
