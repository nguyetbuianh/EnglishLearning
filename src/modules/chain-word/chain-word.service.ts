import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChainWord } from "../../entities/chain-word.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChainWordService {
  constructor(
    @InjectRepository(ChainWord)
    private readonly chainWordRepo: Repository<ChainWord>,
  ) { }

  async saveWord(chainWord: ChainWord): Promise<ChainWord> {
    return this.chainWordRepo.save(chainWord);
  }

  async deleteWord(mezonId: string) {
    this.chainWordRepo.delete({
      mezonId: mezonId
    })
  }

  async getWord(word: string, mezonId: string): Promise<ChainWord | null> {
    return this.chainWordRepo.findOne({
      where: {
        mezonId: mezonId,
        word: word
      }
    })
  }

  async getNewWordOfBot(createBy: string, mezonId: string): Promise<ChainWord | null> {
    return await this.chainWordRepo.findOne({
      where: {
        createBy: createBy,
        mezonId: mezonId
      },
      order: { id: "DESC" }
    })
  }
}