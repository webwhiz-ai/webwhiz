import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateChatbotSessionDTO {
  @IsNotEmpty()
  knowledgebaseId: string;

  userData: any;
}

export class UpdateChatbotSessionDTO {
  userData: any;
}

export class ChatbotQueryDTO {
  @IsNotEmpty()
  sessionId: string;

  @IsNotEmpty()
  query: string;
}

export class ChatMarkAsUnreadDTO {
  @IsString()
  @IsNotEmpty()
  ts: string;
}

export class PromptTestDTO {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsNotEmpty()
  chatbotName: string;

  @IsString()
  @IsNotEmpty()
  query: string;

  @IsArray()
  context: string[];

  @ValidateNested()
  prevMessages: { q: string; a: string }[];

  @IsString()
  defaultAnswer?: string;
}
