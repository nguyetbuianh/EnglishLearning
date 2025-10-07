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
}
