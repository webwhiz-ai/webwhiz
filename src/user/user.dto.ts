import { IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  email: string;

  name?: string;

  password?: string;

  confirmPassword?: string;

  avatarUrl?: string;

  locale?: string;
}
