import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { TranslateDto } from "../dtos/translate.dto";
import { TranslateResponse } from "../responses/translate.response";
import { TranslateService } from "../modules/translaste/translate.service";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('translates')
export class TranslateController {
  constructor(
    private readonly translateService: TranslateService,
  ) { }
  @Post()
  @ApiOkResponse({ type: TranslateResponse })
  async createTranslate(
    @Body() translateDto: TranslateDto
  ): Promise<TranslateResponse> {
    return this.translateService.getOrCreateTranslation(translateDto.word);
  }
}
