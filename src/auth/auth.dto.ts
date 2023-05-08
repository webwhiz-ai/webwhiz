import { IsNotEmpty } from 'class-validator';

export class GoogleAuthDTO {
  @IsNotEmpty()
  token: string;
}

export class AdminLoginDTO {
  @IsNotEmpty()
  id: string;
}
