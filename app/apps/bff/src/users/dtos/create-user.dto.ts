import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: 'The last name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
