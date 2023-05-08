import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { IsObjectId } from '../../common/custom-class-validators';

export class NewOfflineMsgDTO {
  @IsNotEmpty()
  @IsObjectId()
  knowledgebaseId: string;

  @IsNotEmpty()
  @IsObjectId()
  sessionId: string;

  @IsString()
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(1, 500)
  message: string;

  @IsString()
  @IsOptional()
  url?: string;
}
