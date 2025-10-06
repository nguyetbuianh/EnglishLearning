import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ToeicService } from './toeic.service';
import { GetNextQuestionDto, GetNextQuestionSchema } from './dto/get-next-question.dto';

@Controller('toeic')
export class ToeicController {
  constructor(private readonly toeicService: ToeicService) {}

  @Get('tests')
  async getAllTests() {
    return this.toeicService.getAllTests();
  }


  // @Get('part/:partId/next-question')
  // async getNextQuestion(@Param() params: any, @Query() query: any) {
  //   const parseResult = GetNextQuestionSchema.safeParse({ ...params, ...query });

  //   if (!parseResult.success) {
  //     const formattedErrors = parseResult.error.flatten();
  //     throw new BadRequestException(formattedErrors.fieldErrors);
  //   }

  //   const dto: GetNextQuestionDto = parseResult.data;

  //   return this.toeicService.getNextQuestion(dto.partId, dto.last);
  // }

  // @Get('parts')
  // async getAllParts() {
  //   return this.toeicService.getAllParts();
  // }

  // @Get('test/:id')
  // async getTest(@Param('id') id: number) {
  //   return this.toeicService.getTestById(id);
  // }
}
