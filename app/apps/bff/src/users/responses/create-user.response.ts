import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateUserResponse {
  @Expose()
  @ApiProperty()
  accessToken: string;

  constructor(data: CreateUserResponse) {
    this.accessToken = data.accessToken;
  }
}
