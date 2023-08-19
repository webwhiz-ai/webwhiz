import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsObjectId } from '../common/custom-class-validators';

export class CreateKnowledgebaseDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  websiteUrl: string;

  @IsNotEmpty()
  @IsArray()
  urls: string[];

  // Include paths (relative to website url)
  @IsNotEmpty()
  @IsArray()
  include: string[];

  // Exclude paths (relative to website url)
  @IsNotEmpty()
  @IsArray()
  exclude: string[];

  @IsBoolean()
  @IsOptional()
  useAlternateParser?: boolean;
}

export class UpdateKnowledgebaseWebsiteDataDTO {
  @IsNotEmpty()
  websiteUrl: string;

  @IsNotEmpty()
  @IsArray()
  urls: string[];

  // Include paths (relative to website url)
  @IsNotEmpty()
  @IsArray()
  include: string[];

  // Exclude paths (relative to website url)
  @IsNotEmpty()
  @IsArray()
  exclude: string[];

  @IsBoolean()
  @IsOptional()
  useAlternateParser?: boolean;
}

export class SetKnowledgebaseDefaultAnswerDTO {
  @IsString()
  defaultAnswer?: string;
}

export class SetPromptDTO {
  @IsString()
  prompt: string;
}

export class AddCustomChunkDTO {
  @IsNotEmpty()
  q: string;

  @IsNotEmpty()
  a: string;
}

export class PromptDTO {
  @IsObjectId()
  _id?: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;
}

export class KbCustomKeysDTO {
  @IsBoolean()
  @IsNotEmpty()
  useOwnKey: boolean;

  @IsArray()
  @IsNotEmpty({ each: true })
  keys: string[];
}

export class SetAdminEmailDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
