import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  username!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password!: string;
}
