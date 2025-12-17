import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { TranslateDto } from "../../dtos/translate.dto";
import { TranslateResponse } from "../../responses/translate.response";
import { TranslateService } from "./translate.service";
import { DataResponse } from "../../responses/data.response";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('translates')
export class TranslateController {
  constructor(
    private readonly translateService: TranslateService,
  ) { }
  @Post()
  @ApiOkResponse({ type: DataResponse<TranslateResponse> })
  async createTranslate(
    @Body() translateDto: TranslateDto
  ): Promise<DataResponse<TranslateResponse>> {
    const wordData = await this.translateService.getOrCreateTranslation(translateDto.word);
    return {
      data: wordData
    }
  }
}
