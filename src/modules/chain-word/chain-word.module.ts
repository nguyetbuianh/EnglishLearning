import { Module } from "@nestjs/common";
import { ChainWordService } from "./chain-word.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChainWord } from "../../entities/chain-word.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChainWord
    ])
  ],
  providers: [
    ChainWordService
  ],
  exports: [
    ChainWordService
  ],
})
export class ChainWordModule { }