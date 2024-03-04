import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApiKeyDTO {
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
