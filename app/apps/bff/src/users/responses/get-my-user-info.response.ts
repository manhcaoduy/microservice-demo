import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { UserResponse } from './user.response';

export class GetMyUserInfoResponse {
  @Expose()
  @ApiProperty({
    type: UserResponse,
  })
  @Type(() => UserResponse)
  user: UserResponse;

  constructor(data: GetMyUserInfoResponse) {
    this.user = new UserResponse(data.user);
  }
}
