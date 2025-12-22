import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { GuessWordResponse, VerifyWordResponse } from "../../responses/guess-word.response";
import { VocabularyService } from "./vocabulary.service";
import { PaginationResponse, SimpleResponse } from "../../responses/pagination.response";
import { GuessWordDto } from "../../dtos/guess-word.dto";
import { FlashcardResponse } from "../../responses/flashcard.response";
import { FlashcardDto, VocabularyIdDto } from "../../dtos/flashcard.dto";
import { UserDto } from "../../dtos/user.dto";
import { PaginationDto } from "../../dtos/pagination.dto";

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

  @Post('/flashcard')
  @ApiOkResponse({ type: FlashcardResponse })
  async createFlashCard(
    @Body() flashcardDto: FlashcardDto
  ): Promise<FlashcardResponse> {
    return await this.vocabService.createVocab(flashcardDto);
  }

  @Get('/user/:userId')
  @ApiOkResponse({ type: FlashcardResponse })
  async getFlashcard(
    @Param() param: UserDto,
    @Query() pagination: PaginationDto
  ): Promise<PaginationResponse<FlashcardResponse>> {
    return await this.vocabService.getVocabularyOfUser(
      param.userId,
      pagination
    );
  }

  @Delete('/flashcard')
  async DeleteMyFlashcard(
    @Body() vocabularyDto: VocabularyIdDto
  ): Promise<void> {
    await this.vocabService.deleteVocab(vocabularyDto.vocabIds)
  }
}