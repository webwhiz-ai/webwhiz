import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterWebhookDTO {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  signingSecret: string;
}

export class WebhookDTO {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  signingSecret?: string;
}
