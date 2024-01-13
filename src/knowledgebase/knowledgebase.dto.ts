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

  websiteUrl: string;

  @IsOptional()
  @IsArray()
  urls: string[];

  // Include paths (relative to website url)
  @IsOptional()
  @IsArray()
  include: string[];

  // Exclude paths (relative to website url)
  @IsOptional()
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
  @IsString()
  email: string;
}

export class SetModelNameDTO {
  @IsNotEmpty()
  @IsString()
  model: string;
}

export class SetCustomDomainDTO {
  @IsString()
  @IsNotEmpty()
  domain: string;
}

export class SetChatBotNameDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}
