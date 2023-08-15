import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterWebhookDTO {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  signingSecret: string;
}
