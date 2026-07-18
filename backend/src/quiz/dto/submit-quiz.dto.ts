import { IsArray, IsMongoId, ArrayNotEmpty } from 'class-validator';

export class SubmitQuizDto {
  @IsMongoId()
  quizId: string;

  @IsArray()
  @ArrayNotEmpty()
  answers: number[];
}
