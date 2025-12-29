import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { FavoriteVocabularyService } from './favorite-vocabulary.service';
import { PaginationDto } from '../../dtos/pagination.dto';
import { FavVocabResponse } from '../../responses/vocab.response.';
import { PaginationResponse } from '../../responses/pagination.response';
import { FavoriteVocabularyDto } from '../../dtos/favorite-vocabulary.dto';
import { boolean } from 'zod';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('fav/vocabs')
export class FavoriteVocabularyController {
  constructor(
    private readonly favVocabService: FavoriteVocabularyService
  ) { }

  // POST /:vocabId
  @Post(':vocabId')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse()
  async saveFavVocab(
    @Param('vocabId', ParseIntPipe) vocabId: number,
    @Request() req,
  ): Promise<void> {
    const { userId } = req.user;

    await this.favVocabService.saveExistVocab(userId, vocabId);
  }

  // GET 
  @Get()
  @ApiOkResponse({
    type: PaginationResponse<FavVocabResponse>,
  })
  async findFavVocabs(
    @Request() req,
    @Query() paginationQuery: PaginationDto
  ): Promise<PaginationResponse<FavVocabResponse>> {
    const { userId } = req.user;
    const { page, limit } = paginationQuery;

    const { data, pagination } = await this.favVocabService.getVocabularyOfUser(
      userId,
      page,
      limit
    );

    return {
      data,
      pagination
    }
  }

  // DELETE /:vocabId
  @Delete(':vocabId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async deleteFavVocab(
    @Param('vocabId', ParseIntPipe) vocabId: number,
    @Request() req,
  ): Promise<void> {
    const { userId } = req.user;

    await this.favVocabService.deleteVocab(vocabId, userId);
  }

  @Get(':vocabularyId')
  async findVocabularyOfUser(
    //@Param('vocabularyId', ParseIntPipe) vocabularyId: number,
    @Param() favVocabularyDto: FavoriteVocabularyDto,
    @Request() req,
  ): Promise<boolean> {
    const { userId } = req.user;
    console.log(favVocabularyDto.vocabularyId)

    return await this.favVocabService.existingVocabularyAndUserId(
      userId, favVocabularyDto.vocabularyId
    );
  }
}
