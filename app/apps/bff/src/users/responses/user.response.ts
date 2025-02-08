import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponse {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  constructor(data: UserResponse) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.isActive = data.isActive;
  }
}
