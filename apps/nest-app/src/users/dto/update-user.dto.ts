import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Name must be between 3 and 10 characters',
  })
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
