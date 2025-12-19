import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { GuessWordResponse, VerifyWordResponse } from "../../responses/guess-word.response";
import { VocabularyService } from "./vocabulary.service";
import { PaginationResponse, SimpleResponse } from "../../responses/pagination.response";
import { GuessWordDto } from "../../dtos/guess-word.dto";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('guess-word')
export class VocabularyController {
  constructor(
    private readonly vocabService: VocabularyService
  ) { }

  // GET 
  @Get()
  @ApiOkResponse({
    type: SimpleResponse<GuessWordResponse>,
  })
  async getWordAndImage(
  ): Promise<SimpleResponse<GuessWordResponse>> {
    const guessWordData = await this.vocabService.getWordAndImage();

    return {
      data: guessWordData
    }
  }

  // POST /verify-guess-word
  @Post('/verify-guess-word')
  @ApiOkResponse({ type: SimpleResponse<VerifyWordResponse> })
  async verifyWord(
    @Request() req,
    @Body() guessWordBody: GuessWordDto): Promise<SimpleResponse<VerifyWordResponse>> {
    const userId = req.user.userId;
    const { vocabId, wordGuessed } = guessWordBody;
    const responseData = await this.vocabService.guessWordVerify({
      vocabId,
      wordGuessed,
      userId
    });

    return {
      data: responseData
    };
  }
}