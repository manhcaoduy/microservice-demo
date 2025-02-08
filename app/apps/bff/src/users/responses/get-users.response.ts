import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponse } from './user.response';

export class GetUsersResponse {
  @Expose()
  @ApiProperty({
    type: [UserResponse],
  })
  @Type(() => UserResponse)
  users: UserResponse[];

  constructor(data: GetUsersResponse) {
    this.users = data.users.map((user) => new UserResponse(user));
  }
}
