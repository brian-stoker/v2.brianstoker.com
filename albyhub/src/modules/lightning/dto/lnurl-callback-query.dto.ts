import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class LnurlCallbackQueryDto {
  @Type(() => Number)
  @IsInt()
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  comment?: string;
}
