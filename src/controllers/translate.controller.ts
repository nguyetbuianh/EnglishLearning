import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { TranslateDto } from "../dtos/translate.dto";
import { TranslateResponse } from "../responses/translate.response";
import { ApiResponseData } from "../decorators/api-data-response.decorator";
import { TranslateService } from "../modules/translaste/translate.service";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('translates')
export class TranslateController {
  constructor(
    private readonly translateService: TranslateService,
  ) { }
  @Post()
  @ApiResponseData(TranslateResponse)
  async createTranslate(
    @Body() translateDto: TranslateDto
  ): Promise<TranslateResponse> {
    return this.translateService.getOrCreateTranslation(translateDto.word);
  }
}