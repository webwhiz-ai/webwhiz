import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrawlWebsiteDTO {
  @IsString()
  @IsNotEmpty()
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

  @IsOptional()
  @IsNumber()
  maxPages: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
