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
import { DataResponse } from '../../responses/data.response';
import { PaginationDto } from '../../dtos/pagination.dto';
import { FavVocabResponse } from '../../responses/vocab.response.'; 

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
    type: DataResponse<FavVocabResponse>,
  })
  async findFavVocabs(
    @Request() req,
    @Query() paginationQuery: PaginationDto
  ): Promise<DataResponse<FavVocabResponse>> {
    const { userId } = req.user;
    const { page, limit } = paginationQuery;

    const { items, pagination } = await this.favVocabService.getVocabularyOfUser(
      userId,
      page,
      limit
    );

    return {
      data: items,
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
}
