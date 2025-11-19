import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { TranslateService } from "./translate.service";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { Topic } from "../../entities/topic.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { is } from "zod/v4/locales";

interface VocabularyResponse {
  word: string;
  part_of_speech: string;
  meaning: string;
  pronounce: string;
  example_sentence: string;
  is_english: boolean;
  topic: {
    name: string;
    type: string;
    description: string;
  }
}

@Injectable()
export class ImportWordService {
  private readonly logger = new Logger(ImportWordService.name);

  constructor(
    private readonly translateService: TranslateService,

    @InjectRepository(Vocabulary)
    private readonly vocabularyRepo: Repository<Vocabulary>,

    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
  ) { }

  private parseJson<T>(raw: string): T {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error('Error parsing JSON:', err.message);
      }
      throw new BadRequestException('Data returned from AI is not valid JSON.');
    }
  }

  private async saveVocabularyWithLog(vocabulary: Vocabulary): Promise<void> {
    this.logger.log(
      `Saving vocabulary: ${vocabulary.word}...`,
    );

    const saved = await this.vocabularyRepo.save(vocabulary);
    this.logger.debug(`→ Saved vocabulary ID: ${saved.id}`);
  }

  private async buildTopicAndVocabulary(
    item: VocabularyResponse,
  ): Promise<Vocabulary> {
    if (item.is_english === false) {
      throw new BadRequestException('The provided word is not in English.');
    }
    let topic = await this.topicRepo.findOne({
      where: { name: item.topic.name },
    });

    if (!topic) {
      topic = this.topicRepo.create({
        name: item.topic.name,
        type: item.topic.type,
        description: item.topic.description,
      });
      console.log("New topic created");
      console.log(topic);
      await this.topicRepo.save(topic);
    }

    let vocabulary = await this.vocabularyRepo.findOne({
      where: { word: item.word },
      relations: ["topic"],
    });
    if (!vocabulary) {
      vocabulary = this.vocabularyRepo.create({
        word: item.word,
        partOfSpeech: item.part_of_speech,
        meaning: item.meaning,
        pronounce: item.pronounce,
        exampleSentence: item.example_sentence,
        topic: topic,
      });

      console.log("New vocabulary created");
      console.log(vocabulary);
    }

    return vocabulary;
  }

  async importWord(word: string): Promise<VocabularyResponse> {
    const extractedText = await this.translateService.translateWord(word);

    const item = this.parseJson<VocabularyResponse>(extractedText);
    console.log("item" + item);

    const vocab = await this.buildTopicAndVocabulary(item);

    await this.saveVocabularyWithLog(vocab);

    return item;
  }
}