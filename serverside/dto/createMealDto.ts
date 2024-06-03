import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class CreateMealDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly calories: string;

  @IsNotEmpty()
  @IsString()
  readonly allergies: string;

  @IsNotEmpty()
  @IsString()
  readonly extra: string;

  @IsNotEmpty()
  @IsString()
  readonly ingredients: string;

  @IsNotEmpty()
  @IsString()
  readonly day: string;
}
