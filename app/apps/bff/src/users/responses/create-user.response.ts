import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateUserResponse {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;

  constructor(data: CreateUserResponse) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
  }
}
